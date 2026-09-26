from PIL import Image, ImageDraw, ImageFilter
import math, os
import numpy as np

S = 1.5
W,H = int(900*S), int(560*S)
NFRAMES = 72
FPS = 12
BG=(7,17,26)
INK=(190,210,220)
EDGE=(92,119,134)
BLUE=(69,122,151)
TEAL=(86,156,163)
FACE=(53,105,132)
GRID=(20,38,50)

def sc(v): return int(round(v*S))
def pxy(p): return (sc(p[0]), sc(p[1]))

n=18
A=np.zeros((n,n),dtype=float)
for i in range(n):
    for step in (1,2):
        j=(i+step)%n
        A[i,j]=A[j,i]=1.0
for i in range(0,n,3):
    j=(i+6)%n
    A[i,j]=A[j,i]=1.0

deg=A.sum(axis=1)
omega=0.34*np.sin(2*np.pi*np.arange(n)/n)+0.11*np.sin(6*np.pi*np.arange(n)/n+0.4)
K=2.15
th=0.55*np.sin(2*np.pi*np.arange(n)/n+0.2)
dt=0.012
for _ in range(65000):
    diff=th[None,:]-th[:,None]
    coupling=(A*np.sin(diff)).sum(axis=1)/deg
    th += dt*(omega + K*coupling)
z=np.mean(np.exp(1j*th))
th=(th-np.angle(z)+np.pi)%(2*np.pi)-np.pi

cx,cy=530,278
R=178
pos=[]
for i in range(n):
    a=2*np.pi*i/n-0.23
    rr=R*(1+0.035*np.sin(3*a)+0.02*np.cos(5*a))
    pos.append((cx+rr*np.cos(a), cy+0.82*rr*np.sin(a)))
triangles=[(0,1,2),(6,7,8),(12,13,14)]
phase_center=(190,278)
phase_R=108

def glow_line(base, xy, color, width=2, alpha=200, blur=5):
    layer=Image.new('RGBA',(W,H),(0,0,0,0)); ld=ImageDraw.Draw(layer)
    xy2=[pxy(pt) for pt in xy]
    ld.line(xy2,fill=(*color,70),width=sc(width+blur))
    layer=layer.filter(ImageFilter.GaussianBlur(sc(blur/2)))
    base.alpha_composite(layer)
    ImageDraw.Draw(base).line(xy2,fill=(*color,alpha),width=max(1,sc(width)))

frames=[]
for k in range(NFRAMES):
    psi=2*np.pi*k/NFRAMES
    theta=th+psi
    im=Image.new('RGBA',(W,H),(*BG,255)); d=ImageDraw.Draw(im)
    pc=pxy(phase_center)

    for rr in (82,116,150):
        r=sc(rr)
        d.ellipse((pc[0]-r,pc[1]-r,pc[0]+r,pc[1]+r),outline=(*GRID,95),width=max(1,sc(1)))
    pr=sc(phase_R)
    d.ellipse((pc[0]-pr,pc[1]-pr,pc[0]+pr,pc[1]+pr),outline=(*EDGE,105),width=max(1,sc(1)))
    for a in theta:
        x=phase_center[0]+phase_R*np.cos(a); y=phase_center[1]+phase_R*np.sin(a)
        x,y=pxy((x,y)); r=sc(3.2)
        d.ellipse((x-r,y-r,x+r,y+r),fill=(*TEAL,205))
    z=np.mean(np.exp(1j*theta))
    zx=phase_center[0]+phase_R*abs(z)*np.cos(np.angle(z))
    zy=phase_center[1]+phase_R*abs(z)*np.sin(np.angle(z))
    glow_line(im,[phase_center,(zx,zy)],BLUE,width=3,alpha=225,blur=6)
    zx2,zy2=pxy((zx,zy)); r=sc(4.5)
    d.ellipse((zx2-r,zy2-r,zx2+r,zy2+r),fill=(*INK,235))
    d.line((sc(332),sc(118),sc(332),sc(438)),fill=(*GRID,150),width=max(1,sc(1)))

    for tri in triangles:
        poly=[pxy(pos[i]) for i in tri]
        d.polygon(poly,fill=(*FACE,34),outline=(*FACE,86))
    for i in range(n):
        for j in range(i+1,n):
            if A[i,j]:
                sim=(1+math.cos(theta[j]-theta[i]))/2
                alpha=int(45+85*sim)
                d.line((*pxy(pos[i]),*pxy(pos[j])),fill=(*EDGE,alpha),width=max(1,sc(1)))
    for i,(x,y) in enumerate(pos):
        x2,y2=pxy((x,y)); r=sc(6)
        d.ellipse((x2-r,y2-r,x2+r,y2+r),fill=(*BG,255),outline=(*INK,145),width=max(1,sc(1)))
        ex=x+13*np.cos(theta[i]); ey=y+13*np.sin(theta[i])
        d.line((*pxy((x,y)),*pxy((ex,ey))),fill=(*BLUE,225),width=max(1,sc(2)))
        r2=sc(2.2); d.ellipse((x2-r2,y2-r2,x2+r2,y2+r2),fill=(*TEAL,235))
    rho=40
    c2=pxy((cx,cy)); rr=sc(rho)
    qx=cx+rho*np.cos(np.angle(z)); qy=cy+rho*np.sin(np.angle(z))
    d.ellipse((c2[0]-rr,c2[1]-rr,c2[0]+rr,c2[1]+rr),outline=(*GRID,120),width=max(1,sc(1)))
    qx2,qy2=pxy((qx,qy)); rq=sc(3.5)
    d.ellipse((qx2-rq,qy2-rq,qx2+rq,qy2+rq),fill=(*INK,175))
    frames.append(im.convert('P', palette=Image.Palette.ADAPTIVE, colors=128))

outdir='/mnt/data/researcher_site_v6_work/assets/media'
os.makedirs(outdir, exist_ok=True)
# High-resolution GIF, still restrained in palette.
frames[0].save(os.path.join(outdir,'research-hero.gif'),save_all=True,append_images=frames[1:],duration=int(1000/FPS),loop=0,optimize=True,disposal=2)
frames[18].convert('RGB').save(os.path.join(outdir,'research-hero-preview.png'),quality=95)
print('saved', W,H, os.path.getsize(os.path.join(outdir,'research-hero.gif')))
