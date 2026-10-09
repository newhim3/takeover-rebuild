// Small Windows launcher for the existing local game and LAN server.
using System;
using System.Diagnostics;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Management;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Windows.Forms;
using System.Web.Script.Serialization;

internal static class LocalLauncher {
    const string Address = "http://127.0.0.1:4387/";
    static string ExpectedBuild;
    [STAThread] static int Main(string[] args) {
        string root = AppDomain.CurrentDomain.BaseDirectory;
        string native = Path.Combine(root, ".tools", "native");
        string node = Path.Combine(native, "node.exe");
        string server = Path.Combine(root, "server.cjs");
#if LAN_ENTRY
        bool lan = true;
#else
        bool lan = Array.IndexOf(args, "--lan") >= 0;
#endif
        bool check = Array.IndexOf(args, "--check") >= 0;
        bool restart = Array.IndexOf(args, "--restart") >= 0;
        try {
            if (!File.Exists(node) || !File.Exists(server) || !File.Exists(Path.Combine(root, "index.html")))
                throw new Exception("请将启动器放在完整游戏目录中，保留 assets 和 .tools/native/node.exe。");
            ExpectedBuild = ReadBuild(root);
            if (check) {
                File.WriteAllText(Path.Combine(native, "launcher-check.json"),
                    "{\"filesReady\":true,\"serverReady\":" + (Ready(false) ? "true" : "false") +
                    ",\"lanReady\":" + (Ready(true) ? "true" : "false") +
                    ",\"expectedBuild\":\"" + ExpectedBuild + "\",\"entry\":\"" + (lan ? "online" : "home") + "\"}", Encoding.UTF8);
                return 0;
            }
            if (restart || PortableOwnedPayloadChanged(root) || (!Ready(true) && Ready(false))) {
                string reason;
                bool stopped = StopManaged(root, native, node, server, out reason);
                if (!stopped) stopped = StopPortableManaged(root, native, out reason);
                if (!stopped && Ready(false))
                    throw new Exception("4387 端口的服务与本目录的协议或构建版本不符，且无法核验为本启动器托管的进程。请关闭原目录中的游戏服务后重试。启动器不会关闭其它程序。\n核验结果：" + reason);
            }
            if (!Ready(true)) {
                var start = new ProcessStartInfo(node, "\"" + server + "\"");
                start.WorkingDirectory = root;
                start.UseShellExecute = false;
                start.CreateNoWindow = true;
                start.WindowStyle = ProcessWindowStyle.Hidden;
                Log(native, "启动本地服务：" + node + " | " + server);
                var process = Process.Start(start);
                bool ready = false;
                for (int i = 0; i < 40; i++) {
                    Thread.Sleep(150);
                    if (Ready(true)) { ready = true; break; }
                    if (process.HasExited) break;
                }
                if (!ready) {
                    Log(native, "启动失败；进程 " + process.Id + (process.HasExited ? " 退出码 " + process.ExitCode : " 未返回就绪状态"));
                    throw new Exception("本地服务未启动，请检查 4387 端口是否被其他程序占用。启动记录位于 .tools/native/launcher.log。");
                }
                if (!process.HasExited) {
                    File.WriteAllText(Path.Combine(native, "launcher-server.pid"), process.Id.ToString());
                    File.WriteAllText(Path.Combine(native, "launcher-server-state.json"),
                        "{\"pid\":" + process.Id + ",\"createdUtc\":\"" + process.StartTime.ToUniversalTime().ToString("o") +
                        "\",\"nodePath\":\"" + JsonEscape(node) + "\",\"serverPath\":\"" + JsonEscape(server) + "\"}", Encoding.UTF8);
                }
            }
            StorePortableActive(root, native, node, server);
            string address = Address + (lan ? "?online=1" : "");
            Log(native, "打开" + (lan ? "局域网大厅" : "游戏") + "：" + address);
            string edge = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "Microsoft", "Edge", "Application", "msedge.exe");
            if (File.Exists(edge)) {
                var window = new ProcessStartInfo(edge, "--app=\"" + address + "\"");
                window.UseShellExecute = true;
                Process.Start(window);
            } else Process.Start(new ProcessStartInfo(address) { UseShellExecute = true });
            return 0;
        } catch (Exception error) {
            Log(native, "错误：" + error.Message);
            if (check) {
                Directory.CreateDirectory(native);
                File.WriteAllText(Path.Combine(native, "launcher-check-error.txt"), error.Message, Encoding.UTF8);
            } else MessageBox.Show(error.Message, "城邦征战 · 本地启动", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        }
    }
    static bool Ready(bool lan) {
        try {
            var request = (HttpWebRequest)WebRequest.Create(Address + (lan ? "api/lan/peers" : "api/network"));
            request.Timeout = 700;
            request.ReadWriteTimeout = 700;
            request.Proxy = null;
            using (var response = request.GetResponse())
            using (var reader = new StreamReader(response.GetResponseStream()))
                {
                    string body = reader.ReadToEnd();
                    return lan ? LanVersionReady(body, ExpectedBuild) : body.Contains("\"addresses\"");
                }
        } catch { return false; }
    }
    static string ReadBuild(string root) {
        string html = File.ReadAllText(Path.Combine(root, "index.html"));
        var tag = Regex.Match(html, "<meta\\b[^>]*\\bname\\s*=\\s*[\"']game-build[\"'][^>]*>", RegexOptions.IgnoreCase);
        var build = Regex.Match(tag.Value, "\\bcontent\\s*=\\s*[\"']([a-f0-9]{16})[\"']", RegexOptions.IgnoreCase);
        if (!build.Success) throw new Exception("本目录的 index.html 缺少有效构建标识，请保留完整游戏文件。");
        return build.Groups[1].Value.ToLowerInvariant();
    }
    static bool LanVersionReady(string body, string expected) {
        try {
            var data = new JavaScriptSerializer().Deserialize<Dictionary<string, object>>(body);
            object protocol, own;
            if (!data.TryGetValue("lanProtocol", out protocol) || Convert.ToInt32(protocol) != 1 || !data.TryGetValue("self", out own)) return false;
            var self = own as Dictionary<string, object>;
            object build;
            return self != null && self.TryGetValue("build", out build) && String.Equals(build as string, expected, StringComparison.Ordinal);
        } catch { return false; }
    }
    static bool SameAbsolutePath(string actual, string expected) {
        try { return Path.IsPathRooted(actual) && String.Equals(Path.GetFullPath(actual), Path.GetFullPath(expected), StringComparison.OrdinalIgnoreCase); }
        catch { return false; }
    }
    static bool CommandMatches(string command, string node, string server) {
        string nodePattern = Regex.Escape(Path.GetFullPath(node)), serverPattern = Regex.Escape(Path.GetFullPath(server));
        return Regex.IsMatch(command ?? "", "^\\s*(?:\"" + nodePattern + "\"|" + nodePattern + ")\\s+\"" + serverPattern + "\"\\s*$", RegexOptions.IgnoreCase);
    }
    static bool StopManaged(string root, string native, string node, string server, out string reason) {
        reason = "没有本目录的托管记录";
        try {
            string statePath = Path.Combine(native, "launcher-server-state.json");
            if (!File.Exists(statePath)) return false;
            var state = new JavaScriptSerializer().Deserialize<Dictionary<string, object>>(File.ReadAllText(statePath));
            return StopRecorded(state, native, node, server, out reason);
        } catch (Exception error) { reason = error.Message; Log(native, "未重启服务：" + reason); return false; }
    }
    static bool CreatedMatches(DateTime actual, string expected) {
        DateTimeOffset created;
        return DateTimeOffset.TryParse(expected, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out created) &&
            Math.Abs((actual.ToUniversalTime() - created.UtcDateTime).TotalSeconds) <= 1;
    }
    static Process RecordedProcess(Dictionary<string, object> state, string node, string server, out string reason) {
        reason = "托管记录不完整";
        object pidValue, createdValue, nodeValue, serverValue;
        if (!state.TryGetValue("pid", out pidValue) || !state.TryGetValue("createdUtc", out createdValue) || !state.TryGetValue("nodePath", out nodeValue) || !state.TryGetValue("serverPath", out serverValue)) return null;
        int pid;
        if (!Int32.TryParse(Convert.ToString(pidValue, CultureInfo.InvariantCulture), out pid) || pid <= 0 ||
            !SameAbsolutePath(nodeValue as string, node) || !SameAbsolutePath(serverValue as string, server)) {
            reason = "托管记录的 PID 或路径不符"; return null;
        }
        Process process = null;
        try {
            process = Process.GetProcessById(pid);
            if (process.HasExited || !CreatedMatches(process.StartTime, createdValue as string)) throw new Exception("记录 PID 的进程已结束或被其它进程复用");
            using (var identity = new ManagementObject("Win32_Process.Handle='" + pid + "'")) {
                identity.Get();
                if (!SameAbsolutePath(identity["ExecutablePath"] as string, node) || !CommandMatches(identity["CommandLine"] as string, node, server)) throw new Exception("实际程序或启动命令不指向记录中的游戏服务");
            }
            if (process.HasExited || !CreatedMatches(process.StartTime, createdValue as string)) throw new Exception("进程身份在核验期间发生变化");
            reason = "托管进程身份已核验";
            return process;
        } catch (Exception error) {
            if (process != null) process.Dispose();
            reason = error.Message;
            return null;
        }
    }
    static bool StopRecorded(Dictionary<string, object> state, string native, string node, string server, out string reason) {
        using (var process = RecordedProcess(state, node, server, out reason)) {
            if (process == null) return false;
            Log(native, "核验后重启托管服务 PID " + process.Id + "；旧房间结束，请重新创建房间。");
            process.Kill();
            if (!process.WaitForExit(3000)) throw new Exception("托管服务未及时停止，请稍后重试。");
            File.WriteAllText(Path.Combine(native, "restart-notice.txt"), "本地游戏服务已更新或手动重启，原有房间已结束，请重新创建房间。", Encoding.UTF8);
            reason = "托管服务已停止";
            return true;
        }
    }
    static string PortableBase(string root, string baseValue, string hashValue) {
        try {
            if (String.IsNullOrEmpty(baseValue) || !Regex.IsMatch(hashValue ?? "", "^[a-f0-9]{64}$") || !Path.IsPathRooted(baseValue)) return null;
            string canonical = Path.GetFullPath(baseValue).TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
            string volumeRoot = Path.GetPathRoot(canonical).TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
            if (String.Equals(canonical, volumeRoot, StringComparison.OrdinalIgnoreCase) || String.IsNullOrEmpty(Path.GetDirectoryName(canonical)) || !String.Equals(Path.GetFileName(canonical), "TakeoverPortable", StringComparison.OrdinalIgnoreCase)) return null;
            string current = Path.Combine(canonical, hashValue.Substring(0, 16), "城邦征战");
            return SameAbsolutePath(root, current) ? canonical : null;
        } catch { return null; }
    }
    static bool PortableRecordPaths(string cacheBase, Dictionary<string, object> state, out string node, out string server) {
        node = null; server = null;
        object hashValue, directoryValue, nodeValue, serverValue;
        if (!state.TryGetValue("hash", out hashValue) || !state.TryGetValue("cacheDirectory", out directoryValue) || !state.TryGetValue("nodePath", out nodeValue) || !state.TryGetValue("serverPath", out serverValue)) return false;
        string hash = hashValue as string;
        if (!Regex.IsMatch(hash ?? "", "^[a-f0-9]{64}$")) return false;
        string directory = Path.Combine(cacheBase, hash.Substring(0, 16), "城邦征战");
        node = Path.Combine(directory, ".tools", "native", "node.exe");
        server = Path.Combine(directory, "server.cjs");
        return SameAbsolutePath(directoryValue as string, directory) && SameAbsolutePath(nodeValue as string, node) && SameAbsolutePath(serverValue as string, server);
    }
    static bool StopPortableManaged(string root, string native, out string reason) {
        reason = "没有可核验的便携版托管记录";
        try {
            string cacheBase = PortableBase(root, Environment.GetEnvironmentVariable("TAKEOVER_PORTABLE_ROOT"), Environment.GetEnvironmentVariable("TAKEOVER_PORTABLE_HASH"));
            if (cacheBase == null) return false;
            string statePath = Path.Combine(cacheBase, "active-service.json");
            if (!File.Exists(statePath)) return false;
            var state = new JavaScriptSerializer().Deserialize<Dictionary<string, object>>(File.ReadAllText(statePath));
            string node, server;
            if (!PortableRecordPaths(cacheBase, state, out node, out server)) { reason = "便携版记录不在指定缓存目录中"; return false; }
            return StopRecorded(state, native, node, server, out reason);
        } catch (Exception error) { reason = error.Message; Log(native, "未重启便携版服务：" + reason); return false; }
    }
    static bool PortableUpdateNeeded(string currentHash, string recordedHash, bool liveIdentityVerified) {
        return liveIdentityVerified && Regex.IsMatch(currentHash ?? "", "^[a-f0-9]{64}$") &&
            Regex.IsMatch(recordedHash ?? "", "^[a-f0-9]{64}$") && !String.Equals(currentHash, recordedHash, StringComparison.Ordinal);
    }
    static bool PortableOwnedPayloadChanged(string root) {
        try {
            string hash = Environment.GetEnvironmentVariable("TAKEOVER_PORTABLE_HASH");
            string cacheBase = PortableBase(root, Environment.GetEnvironmentVariable("TAKEOVER_PORTABLE_ROOT"), hash);
            if (cacheBase == null) return false;
            string statePath = Path.Combine(cacheBase, "active-service.json");
            if (!File.Exists(statePath)) return false;
            var state = new JavaScriptSerializer().Deserialize<Dictionary<string, object>>(File.ReadAllText(statePath));
            string node, server;
            if (!PortableRecordPaths(cacheBase, state, out node, out server) || !PortableUpdateNeeded(hash, state["hash"] as string, true)) return false;
            string reason;
            using (var process = RecordedProcess(state, node, server, out reason)) {
                return PortableUpdateNeeded(hash, state["hash"] as string, process != null);
            }
        } catch { return false; }
    }
    static void StorePortableActive(string root, string native, string node, string server) {
        try {
            string hash = Environment.GetEnvironmentVariable("TAKEOVER_PORTABLE_HASH");
            string cacheBase = PortableBase(root, Environment.GetEnvironmentVariable("TAKEOVER_PORTABLE_ROOT"), hash);
            if (cacheBase == null) return;
            string localStatePath = Path.Combine(native, "launcher-server-state.json");
            if (!File.Exists(localStatePath)) return;
            var state = new JavaScriptSerializer().Deserialize<Dictionary<string, object>>(File.ReadAllText(localStatePath));
            string reason;
            using (var process = RecordedProcess(state, node, server, out reason)) {
                if (process == null) return;
                state["hash"] = hash; state["cacheDirectory"] = Path.GetFullPath(root).TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar); state["build"] = ExpectedBuild;
                string target = Path.Combine(cacheBase, "active-service.json"), temporary = target + "." + Process.GetCurrentProcess().Id + ".tmp";
                File.WriteAllText(temporary, new JavaScriptSerializer().Serialize(state), Encoding.UTF8);
                if (File.Exists(target)) File.Replace(temporary, target, null); else File.Move(temporary, target);
            }
        } catch (Exception error) { Log(native, "未写入便携版托管记录：" + error.Message); }
    }
    static string JsonEscape(string value) { return value.Replace("\\", "\\\\").Replace("\"", "\\\""); }
    static void Log(string native, string message) {
        try {
            Directory.CreateDirectory(native);
            File.AppendAllText(Path.Combine(native, "launcher.log"), DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + " " + message + Environment.NewLine, Encoding.UTF8);
        } catch { }
    }
}
