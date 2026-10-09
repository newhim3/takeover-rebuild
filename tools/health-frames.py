from PIL import Image,ImageDraw
im=Image.open('assets/takeover/animation/anim/SquadRoundIconClass.png');out=Image.new('RGB',(600,600),'#24382d');d=ImageDraw.Draw(out)
for i in range(100):
 x=i%10*60;y=i//10*60;out.paste(im.crop((i*40,0,i*40+40,40)),(x+10,y),im.crop((i*40,0,i*40+40,40)));d.text((x+20,y+43),str(i),fill='white')
out.save('reference/health-frames.jpg')
