// Gemeinsame Klang-Bausteine für Spiele mit eigenen Geräuschen (Auf der Jagd, Almsommer).
// Alles wird live im Browser erzeugt (Web Audio, keine Tondateien) und läuft im Audio-Kontext der Spielstube:
// play(sfx, fn) ruft fn(ctx, jetzt) nur auf, wenn der Ton nicht stumm geschaltet ist (🔊/🔇).
(function (root) {
  let bus = null; // Ausgang (master) und kurzer Nachhall (rev) – einmal je Audio-Kontext angelegt

  function ensureBus(ctx) {
    if (bus && bus.ctx === ctx) return bus;
    const master = ctx.createGain(); master.gain.value = 0.7; master.connect(ctx.destination);
    // kurzer Nachhall (~0,5 s) aus abklingendem Rauschen – kein Echo
    const len = Math.floor(ctx.sampleRate * 0.55), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    const verb = ctx.createConvolver(); verb.buffer = ir;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2200;
    const rev = ctx.createGain(); rev.gain.value = 0.55; rev.connect(verb); verb.connect(lp); lp.connect(master);
    return (bus = { ctx, master, rev });
  }
  function play(sfx, fn) {
    sfx.audio((ctx) => { if (!ctx) return; ensureBus(ctx); fn(ctx, ctx.currentTime); });
  }
  // Rauschen (weiß oder – brown = true – tief und weich, z. B. für Donner)
  function nbuf(ctx, sec, brown) {
    const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * sec), ctx.sampleRate), d = b.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w; }
    return b;
  }
  function envl(g, t, a, peak, dcy) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dcy); }
  // gefiltertes Rauschen mit kurzer Hüllkurve; rev = Anteil im Nachhall
  function noise(ctx, t, dur, { type = "lowpass", freq = 2000, q = 0.7, a = 0.002, peak = 0.6, sweepTo = null, rev = 0, brown = false } = {}) {
    const s = ctx.createBufferSource(); s.buffer = nbuf(ctx, dur + 0.1, brown);
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    const g = ctx.createGain(); envl(g, t, a, peak, dur);
    s.connect(f); f.connect(g); g.connect(bus.master);
    if (rev) { const e = ctx.createGain(); e.gain.value = rev; g.connect(e); e.connect(bus.rev); }
    s.start(t); s.stop(t + a + dur + 0.1);
  }
  // Ton (Sinus, Dreieck, Sägezahn …) mit Hüllkurve, optional Gleiten (f1), Vibrato und Filter
  function tone(ctx, t, dur, { type = "sine", f0 = 440, f1 = null, a = 0.005, peak = 0.3, rev = 0, vib = 0, filter = null } = {}) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    if (vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 5.5; lg.gain.value = vib; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + a + dur + 0.05); }
    const g = ctx.createGain(); envl(g, t, a, peak, dur);
    let last = o;
    if (filter) { const f = ctx.createBiquadFilter(); f.type = filter.type; f.frequency.setValueAtTime(filter.freq, t); if (filter.to) f.frequency.exponentialRampToValueAtTime(filter.to, t + (filter.at || dur)); f.Q.value = filter.q || 1; o.connect(f); last = f; }
    last.connect(g); g.connect(bus.master);
    if (rev) { const e = ctx.createGain(); e.gain.value = rev; g.connect(e); e.connect(bus.rev); }
    o.start(t); o.stop(t + a + dur + 0.05);
  }
  // Ausgang/Nachhall für eigene Verkettungen (z. B. Hüllkurven, die hier nicht vorgesehen sind)
  const out = () => bus;

  root.S10Klang = { play, nbuf, noise, tone, out };
})(window);
