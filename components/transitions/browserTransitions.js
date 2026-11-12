import { d, easeIO, easeO, pick, rnd, sleep } from './pageTransitions';

export async function runBrowserTransition(stage, a, b, id) {
    const doc = stage.ownerDocument;
    const window = doc.defaultView;
    const NS = 'http://www.w3.org/2000/svg';
    const dims = () => {
        const { width, height } = stage.getBoundingClientRect();
        return { W: width, H: height };
    };
    const tween = (ms, fn, ease = (t) => t) => new Promise((resolve, reject) => {
        const start = window.performance.now();
        function frame(now) {
            try {
                const t = Math.min(1, (now - start) / ms);
                fn(ease(t));
                if (t < 1) window.requestAnimationFrame(frame);
                else resolve();
            } catch (error) {
                reject(error);
            }
        }
        frame(start);
    });
    const el = (tag, cls, html) => {
        const element = doc.createElement(tag);
        element.className = 'fx ' + cls;
        if (html) element.innerHTML = html;
        stage.appendChild(element);
        return element;
    };
    const A = (element, keyframes, options) => element.animate(keyframes, { fill: 'both', ...options }).finished;
    const svgEl = (tag, attributes) => {
        const element = doc.createElementNS(NS, tag);
        Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
        return element;
    };
    const shake = (ms = 200) => stage.animate([
        { transform: 'translate(0,0)' }, { transform: 'translate(0,6px)' }, { transform: 'translate(3px,-4px)' }, { transform: 'none' },
    ], { duration: d(ms) });

    const TR = {};
    TR.door = async (a, b) => {
      a.style.zIndex=2;b.style.zIndex=1;
      const L=el('div','loader',`<div class="scene"><div class="frame"><div class="light"></div><div class="doorp"><i class="plate">208</i><i class="peep"></i><i class="pn p1"></i><i class="pn p2"></i><i class="knob"></i></div></div><div class="mat">WELCOME HOME</div></div><div class="ltxt">Moving you in<i>.</i><i>.</i><i>.</i></div>`);
      const door=L.querySelector('.doorp'),light=L.querySelector('.light'),fr=L.querySelector('.frame');
      await A(L,[{opacity:0,transform:'scale(.82)'},{opacity:1,transform:'scale(1)'}],{duration:d(230),easing:'cubic-bezier(.2,.9,.3,1.3)'});
      a.style.visibility='hidden';
      await sleep(d(120));
      void A(light,[{opacity:0},{opacity:1}],{duration:d(450),delay:d(80)}).catch(() => {});
      void A(fr,[{boxShadow:'0 0 0 0 #ffd45e00'},{boxShadow:'0 0 90px 26px #ffd45ea8'}],{duration:d(700)}).catch(() => {});
      await A(door,[{transform:'rotateY(0deg)'},{transform:'rotateY(-72deg)'}],{duration:d(700),easing:'cubic-bezier(.3,1.35,.5,1)'});
      await sleep(d(240));
      const sr=stage.getBoundingClientRect(),f=fr.getBoundingClientRect();
      const t=f.top-sr.top,l=f.left-sr.left,r=sr.right-f.right,bt=sr.bottom-f.bottom;
      const from=`inset(${t}px ${r}px ${bt}px ${l}px round 6px)`;
      b.style.zIndex=45;b.style.clipPath=from;
      await b.animate([{clipPath:from},{clipPath:'inset(0px 0px 0px 0px round 0px)'}],{duration:d(560),easing:'cubic-bezier(.7,0,.3,1)',fill:'forwards'}).finished;
    };

    TR.sticky = async (a, b) => {
      const {W,H}=dims();a.style.zIndex=2;b.style.zIndex=1;
      const cols=5,rows=9,cw=W/cols,ch=H/rows,pal=['#fff08a','#ffb3c7','#a8e0ff','#b9f2b0','#ffd29a'];
      const words=['pickup 5pm','textbooks $20','desk lamp?','free couch!','laundry :(','ramen','move-in day','dorm deal!','study grp','mini fridge','lease?','extension cord'];
      const notes=[];
      for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
        const n=el('div','sticky',Math.random()<.35?pick(words):'');
        n.style.cssText+=`left:${c*cw-8}px;top:${r*ch-8}px;width:${cw+16}px;height:${ch+16}px;background:${pick(pal)}`;
        notes.push({n,rot:rnd(-7,7)});
      }
      await Promise.all(notes.map(({n,rot})=>A(n,[{opacity:0,transform:`scale(1.9) rotate(${rot+25}deg)`},{opacity:1,transform:`scale(1) rotate(${rot}deg)`}],{duration:d(180),delay:d(rnd(0,520)),easing:'cubic-bezier(.2,.9,.3,1.3)'})));
      a.style.visibility='hidden';await sleep(d(80));
      await Promise.all(notes.map(({n,rot})=>A(n,[{opacity:1,transform:`rotate(${rot}deg)`},{opacity:0,transform:`translate(${rnd(-40,40)}px,${-rnd(120,220)}px) rotateX(75deg) rotate(${rot+rnd(-40,40)}deg)`}],{duration:d(400),delay:d(rnd(0,430)),easing:'ease-in'})));
    };

    TR.stamp = async (a, b) => {
      const {W,H}=dims();a.style.zIndex=1;b.style.zIndex=5;b.style.clipPath='circle(0px at 50% 50%)';
      const s=el('div','stamp','DEAL!<small>DORMDEAL ✓</small>');
      const rot='rotate(-10deg)';
      await A(s,[{opacity:0,transform:`translate(-50%,-50%) scale(3.6) rotate(-16deg)`},{opacity:1,transform:`translate(-50%,-50%) scale(1) ${rot}`,offset:.72},{transform:`translate(-50%,-50%) scale(.92) ${rot}`,offset:.86},{opacity:1,transform:`translate(-50%,-50%) scale(1) ${rot}`}],{duration:d(420),easing:'ease-in'});
      shake();
      const ring=el('div','ring'),max=Math.hypot(W,H)/2+30;
      await Promise.all([
        tween(d(800),t=>{const r=max*t;b.style.clipPath=`circle(${r}px at 50% 50%)`;ring.style.width=ring.style.height=(2*r+6)+'px'},easeO),
        sleep(d(450)).then(()=>A(s,[{opacity:1},{opacity:0}],{duration:d(300)}))]);
      ring.remove();
    };

    TR.plane = async (a, b) => {
      const {W,H}=dims();a.style.zIndex=1;b.style.zIndex=5;
      const mask='linear-gradient(to top right,#000 var(--p),transparent calc(var(--p) + .4%))';
      b.style.webkitMaskImage=mask;b.style.maskImage=mask;b.style.setProperty('--p','-1%');
      const tr=svgEl('svg',{class:'fx trail',viewBox:`0 0 ${W} ${H}`});tr.setAttribute('style','');
      const pl=svgEl('polyline',{fill:'none',stroke:'#7a0000','stroke-width':3,'stroke-linecap':'round','stroke-dasharray':'1 9',opacity:.8});
      tr.appendChild(pl);stage.appendChild(tr);
      const p=el('div','plane',`<svg viewBox="0 0 80 50" width="80" height="50"><polygon points="0,4 80,25 20,25" fill="#fff"/><polygon points="0,46 80,25 20,25" fill="#d9d4cb"/><polygon points="20,25 0,4 8,25" fill="#eee"/><line x1="20" y1="25" x2="80" y2="25" stroke="#bbb" stroke-width="1"/></svg>`);
      p.style.transformOrigin='100% 50%';
      const pts=[],ang=Math.atan2(-H,W)*180/Math.PI;
      await tween(d(1400),t=>{
        const s=-.08+t*1.2,wave=Math.sin(t*Math.PI*3)*34;
        const nx=-Math.sin(ang*Math.PI/180),ny=Math.cos(ang*Math.PI/180);
        const x=W*s+nx*wave,y=H*(1-s)+ny*wave;
        b.style.setProperty('--p',(s*100)+'%');
        const rot=ang+Math.cos(t*Math.PI*3)*16;
        p.style.transform=`translate(${x-80}px,${y-25}px) rotate(${rot}deg)`;
        pts.push(`${x-40*Math.cos(ang*Math.PI/180)},${y-40*Math.sin(ang*Math.PI/180)}`);pl.setAttribute('points',pts.join(' '));
      },easeIO);
      await A(tr,[{opacity:1},{opacity:0}],{duration:d(250)});
    };

    a.classList.add('anim');
    b.classList.add('anim');
    try {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            await A(b, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
        } else {
            await TR[id](a, b);
        }
    } finally {
        for (const screen of [a, b]) {
            screen.getAnimations?.().forEach((animation) => animation.cancel());
            screen.removeAttribute('style');
            screen.classList.remove('anim');
        }
        stage.querySelectorAll('.fx').forEach((effect) => {
            effect.getAnimations?.({ subtree: true }).forEach((animation) => animation.cancel());
            effect.remove();
        });
        stage.getAnimations?.().forEach((animation) => animation.cancel());
        a.classList.remove('active');
        b.classList.add('active');
    }
}
