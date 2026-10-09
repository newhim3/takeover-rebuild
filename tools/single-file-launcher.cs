// Single-file distribution for the existing game. Extraction runs once per payload.
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;
using System.Windows.Forms;

internal static class SingleFileLauncher {
    const string FooterMagic = "TAKEOVER_EXE_V1!";
    const string GameFolder = "城邦征战";
    const string ReadyName = "portable-ready.json";
    static readonly string[] Critical = { "城邦征战.exe", "局域网联机.exe", ".tools/native/node.exe", "server.cjs", "index.html", "game-shell.js", "game-shell.css", "delivery-manifest.json" };
    static readonly JavaScriptSerializer Json = new JavaScriptSerializer();
    sealed class Payload { public long Offset, Length; public string Hash; }
    [STAThread] static int Main(string[] args) {
        AppContext.SetSwitch("Switch.System.IO.UseLegacyPathHandling", false);
        AppContext.SetSwitch("Switch.System.IO.BlockLongPaths", false);
        bool check = Has(args, "--check"), prepare = Has(args, "--prepare-only");
        string report = Value(args, "--report");
        ProgressWindow progress = null;
        var clock = Stopwatch.StartNew();
        try {
            string executable = Application.ExecutablePath;
            Payload payload = ReadPayload(executable);
            string cacheBase = Path.GetFullPath(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "TakeoverPortable"));
            string customCache = Value(args, "--cache-root");
            if (!String.IsNullOrEmpty(customCache)) {
                if (!prepare || !Path.IsPathRooted(customCache)) throw new Exception("自定义缓存路径仅供准备检查使用。");
                cacheBase = Path.GetFullPath(customCache);
            }
            if (!String.Equals(Path.GetFileName(cacheBase.TrimEnd(Path.DirectorySeparatorChar)), "TakeoverPortable", StringComparison.OrdinalIgnoreCase)) throw new Exception("缓存路径无效。");
            string cache = Path.Combine(cacheBase, payload.Hash.Substring(0, 16));
            var result = new Dictionary<string, object> { {"payloadHash",payload.Hash}, {"payloadBytes",payload.Length}, {"cacheDirectory",cache}, {"launched",false} };
            if (check) {
                using (var file = File.OpenRead(executable))
                using (var slice = new SliceStream(file, payload.Offset, payload.Length)) {
                VerifyHash(slice, payload, null);
                using (var archive = new ZipArchive(slice, ZipArchiveMode.Read)) {
                    long total = 0;
                    foreach (var entry in archive.Entries) { ValidateEntry(entry.FullName, cache); total = checked(total + entry.Length); }
                    foreach (string name in Critical) if (archive.GetEntry(GameFolder + "/" + name) == null) throw new Exception("安装包缺少文件：" + name);
                    result["files"] = archive.Entries.Count; result["uncompressedBytes"] = total; result["passed"] = true;
                }
                }
            } else {
                bool reused = IsReady(cache, payload);
                if (!reused && !prepare) { progress = new ProgressWindow(); progress.Show(); Application.DoEvents(); }
                if (!reused) {
                    using (var mutex = new Mutex(false, "Local\\TakeoverPortable_" + payload.Hash)) {
                        bool acquired = false;
                        try {
                            var waiting = Stopwatch.StartNew();
                            while (!acquired) {
                                try { acquired = mutex.WaitOne(50); } catch (AbandonedMutexException) { acquired = true; }
                                if (acquired) break;
                                if (progress != null) progress.UpdateStatus(0, "正在等待另一启动进程准备素材…");
                                if (waiting.ElapsedMilliseconds > 120000) throw new Exception("另一启动进程仍在准备素材，请稍后重试。");
                            }
                            reused = IsReady(cache, payload);
                            if (!reused) Extract(executable, payload, cacheBase, cache, progress);
                        } finally { if (acquired) mutex.ReleaseMutex(); }
                    }
                }
                string root = Path.Combine(cache, GameFolder);
                result["cacheReused"] = reused; result["prepared"] = true; result["passed"] = true;
                if (!prepare) {
                    if (progress != null) progress.UpdateStatus(100, "素材准备完成，正在启动游戏…");
                    var launch = new ProcessStartInfo(Path.Combine(root, "城邦征战.exe"), (Has(args, "--lan") ? "--lan " : "") + (Has(args, "--restart") ? "--restart" : ""));
                    launch.WorkingDirectory = root; launch.UseShellExecute = false; launch.CreateNoWindow = true; launch.WindowStyle = ProcessWindowStyle.Hidden;
                    launch.EnvironmentVariables["TAKEOVER_PORTABLE_ROOT"] = cacheBase;
                    launch.EnvironmentVariables["TAKEOVER_PORTABLE_HASH"] = payload.Hash;
                    Process.Start(launch); result["launched"] = true;
                }
            }
            result["elapsedMs"] = clock.ElapsedMilliseconds;
            if (!String.IsNullOrEmpty(report)) File.WriteAllText(report, Json.Serialize(result), new UTF8Encoding(false));
            return 0;
        } catch (Exception error) {
            if (!String.IsNullOrEmpty(report)) File.WriteAllText(report, Json.Serialize(new Dictionary<string, object> {{"passed",false},{"error",error.Message},{"launched",false}}), new UTF8Encoding(false));
            if (!check && !prepare) MessageBox.Show(error.Message, "城邦征战 · 本地启动", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        } finally { if (progress != null) progress.Dispose(); }
    }
    static bool Has(string[] args, string name) { return Array.IndexOf(args, name) >= 0; }
    static string Value(string[] args, string name) { int i = Array.IndexOf(args, name); return i >= 0 && i + 1 < args.Length ? args[i + 1] : null; }
    static Payload ReadPayload(string executable) {
        using (var file = File.OpenRead(executable)) {
            if (file.Length < 64) throw new Exception("游戏安装包不完整。");
            file.Seek(-64, SeekOrigin.End);
            using (var reader = new BinaryReader(file, Encoding.UTF8, true)) {
                if (Encoding.ASCII.GetString(reader.ReadBytes(16)) != FooterMagic) throw new Exception("游戏安装包标识错误，请保留完整 EXE。");
                long offset = reader.ReadInt64(), length = reader.ReadInt64(); byte[] hash = reader.ReadBytes(32);
                if (offset < 1024 || length < 22 || offset > file.Length - 64 || length != file.Length - offset - 64 || hash.Length != 32) throw new Exception("游戏安装包长度不完整。");
                return new Payload { Offset = offset, Length = length, Hash = BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant() };
            }
        }
    }
    static bool IsReady(string cache, Payload payload) {
        try {
            string marker = Path.Combine(cache, ReadyName), root = Path.Combine(cache, GameFolder);
            if (!File.Exists(marker)) return false;
            var record = Json.Deserialize<Dictionary<string, object>>(File.ReadAllText(marker)); object hash, sizesValue;
            if (!record.TryGetValue("hash", out hash) || !String.Equals(hash as string, payload.Hash, StringComparison.Ordinal) || !record.TryGetValue("criticalSizes", out sizesValue)) return false;
            var sizes = sizesValue as Dictionary<string, object>;
            if (sizes == null) return false;
            foreach (string name in Critical) {
                object size; string file = Path.Combine(root, name.Replace('/', Path.DirectorySeparatorChar));
                if (!sizes.TryGetValue(name, out size) || !File.Exists(file) || new FileInfo(file).Length != Convert.ToInt64(size)) return false;
            }
            return true;
        } catch { return false; }
    }
    static void VerifyHash(SliceStream slice, Payload payload, ProgressWindow progress) {
        slice.Position = 0;
        using (var hash = SHA256.Create()) {
            byte[] buffer = new byte[262144]; long readTotal = 0; int read; var refresh = Stopwatch.StartNew();
            while ((read = slice.Read(buffer, 0, buffer.Length)) > 0) {
                hash.TransformBlock(buffer, 0, read, null, 0); readTotal += read;
                if (progress != null && refresh.ElapsedMilliseconds >= 100) { progress.UpdateStatus((int)(readTotal * 15 / payload.Length), "正在校验本地素材包；只在首次准备时执行。"); refresh.Restart(); }
            }
            hash.TransformFinalBlock(new byte[0], 0, 0);
            string actual = BitConverter.ToString(hash.Hash).Replace("-", "").ToLowerInvariant();
            if (actual != payload.Hash) throw new Exception("游戏文件校验失败，请重新复制完整 EXE。");
        }
        slice.Position = 0;
    }
    static string ValidateEntry(string name, string directory) {
        if (!name.StartsWith(GameFolder + "/", StringComparison.Ordinal) || name.IndexOf('\\') >= 0 || name.IndexOf(':') >= 0 || name.IndexOf('\0') >= 0) throw new Exception("安装包路径无效。");
        foreach (string part in name.Split('/')) if (part == "." || part == "..") throw new Exception("安装包包含越界路径。");
        string prefix = Path.GetFullPath(directory).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
        string target = Path.GetFullPath(Path.Combine(directory, name.Replace('/', Path.DirectorySeparatorChar)));
        if (!target.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)) throw new Exception("安装包路径超出缓存目录。");
        return target;
    }
    static void Extract(string executable, Payload payload, string cacheBase, string cache, ProgressWindow progress) {
        Directory.CreateDirectory(cacheBase);
        // An invalid final cache is retained for inspection; never rename an active game's files.
        if (Directory.Exists(cache)) throw new Exception("本地游戏缓存不完整。请关闭游戏，将此目录移走后重新运行：\n" + cache);
        string staging = Path.Combine(cacheBase, "p-" + Guid.NewGuid().ToString("N").Substring(0, 16));
        try {
        using (var file = File.OpenRead(executable))
        using (var slice = new SliceStream(file, payload.Offset, payload.Length)) {
        VerifyHash(slice, payload, progress);
        using (var archive = new ZipArchive(slice, ZipArchiveMode.Read)) {
            long total = 0; var names = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var entry in archive.Entries) { string path = ValidateEntry(entry.FullName, staging); if (!names.Add(path)) throw new Exception("安装包包含重复路径。"); total = checked(total + entry.Length); }
            if (total > 4294967296L) throw new Exception("素材容量超出本地启动器支持范围。");
            if (new DriveInfo(Path.GetPathRoot(cacheBase)).AvailableFreeSpace < total + 67108864) throw new Exception("磁盘剩余空间不足，请至少预留约 800 MB。");
            Directory.CreateDirectory(staging);
            long written = 0; int count = 0; var refresh = Stopwatch.StartNew(); byte[] buffer = new byte[262144];
            foreach (var entry in archive.Entries) {
                string target = ValidateEntry(entry.FullName, staging);
                if (entry.FullName.EndsWith("/", StringComparison.Ordinal)) { Directory.CreateDirectory(target); continue; }
                Directory.CreateDirectory(Path.GetDirectoryName(target));
                using (var input = entry.Open())
                using (var output = new FileStream(target, FileMode.CreateNew, FileAccess.Write, FileShare.None, 65536)) {
                    int read; long bytes = 0;
                    while ((read = input.Read(buffer, 0, buffer.Length)) > 0) { output.Write(buffer, 0, read); bytes += read; written += read; }
                    if (bytes != entry.Length) throw new Exception("素材文件长度不完整：" + entry.FullName);
                }
                count++;
                if (progress != null && refresh.ElapsedMilliseconds >= 100) { progress.UpdateStatus(total == 0 ? 100 : 15 + (int)(written * 85 / total), "首次准备本地素材 " + count + "/" + archive.Entries.Count + "；以后直接使用缓存。"); refresh.Restart(); }
            }
            var criticalSizes = new Dictionary<string, object>();
            foreach (string name in Critical) { string path = Path.Combine(staging, GameFolder, name.Replace('/', Path.DirectorySeparatorChar)); if (!File.Exists(path)) throw new Exception("素材包缺少启动文件：" + name); criticalSizes[name] = new FileInfo(path).Length; }
            File.WriteAllText(Path.Combine(staging, ReadyName), Json.Serialize(new Dictionary<string, object> {{"hash",payload.Hash},{"files",count},{"bytes",written},{"criticalSizes",criticalSizes}}), new UTF8Encoding(false));
            Directory.Move(staging, cache);
        }
        }
        } catch {
            string basePrefix = Path.GetFullPath(cacheBase).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
            string ownedStaging = Path.GetFullPath(staging);
            if (ownedStaging.StartsWith(basePrefix, StringComparison.OrdinalIgnoreCase) && Path.GetFileName(ownedStaging).StartsWith("p-", StringComparison.Ordinal) && Directory.Exists(ownedStaging)) {
                try { Directory.Delete(ownedStaging, true); } catch { }
            }
            throw;
        }
    }
    sealed class ProgressWindow : Form {
        readonly Label text = new Label(); readonly ProgressBar bar = new ProgressBar();
        public ProgressWindow() {
            Text = "城邦征战 · 首次准备"; Width = 460; Height = 145; StartPosition = FormStartPosition.CenterScreen;
            FormBorderStyle = FormBorderStyle.FixedDialog; MaximizeBox = false; MinimizeBox = false; ControlBox = false;
            text.Left = 18; text.Top = 18; text.Width = 410; text.Height = 40; text.Text = "正在准备本地素材；只在首次运行时解包。";
            bar.Left = 18; bar.Top = 65; bar.Width = 410; bar.Height = 18;
            Controls.Add(text); Controls.Add(bar);
        }
        public void UpdateStatus(int percent, string message) { text.Text = message; bar.Value = Math.Max(0, Math.Min(100, percent)); Application.DoEvents(); }
    }
    sealed class SliceStream : Stream {
        readonly Stream source; readonly long origin, length; long position;
        public SliceStream(Stream source, long origin, long length) { this.source = source; this.origin = origin; this.length = length; source.Position = origin; }
        public override bool CanRead { get { return true; } } public override bool CanSeek { get { return true; } } public override bool CanWrite { get { return false; } }
        public override long Length { get { return length; } } public override long Position { get { return position; } set { Seek(value, SeekOrigin.Begin); } }
        public override int Read(byte[] buffer, int offset, int count) { source.Position = origin + position; int read = source.Read(buffer, offset, (int)Math.Min(count, length - position)); position += read; return read; }
        public override long Seek(long offset, SeekOrigin way) { long next = checked((way == SeekOrigin.Begin ? 0 : way == SeekOrigin.Current ? position : length) + offset); if (next < 0 || next > length) throw new IOException("超出安装包范围。"); position = next; source.Position = origin + position; return position; }
        public override void Flush() { } public override void SetLength(long value) { throw new NotSupportedException(); } public override void Write(byte[] buffer, int offset, int count) { throw new NotSupportedException(); }
    }
}
