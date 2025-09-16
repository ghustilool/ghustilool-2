// Cargar particles.js desde CDN
const script = document.createElement('script');
script.src = "https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js";
script.onload = () => {
  particlesJS("neon-background", {
    "particles": {
      "number": { "value": 80 },
      "color": { "value": "#00ffcc" },
      "shape": { "type": "circle" },
      "opacity": { "value": 0.5 },
      "size": { "value": 3 },
      "move": {
        "enable": true,
        "speed": 2,
        "direction": "bottom",
        "out_mode": "out"
      }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": { "onhover": { "enable": false } }
    },
    "retina_detect": true
  });
};
document.body.appendChild(script);
