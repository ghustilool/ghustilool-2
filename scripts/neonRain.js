// Cargar particles.js desde CDN
const script = document.createElement('script');
script.src = "https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js";
script.onload = () => {
  particlesJS("neon-background", {
    "particles": {
      "number": {
        "value": 120,
        "density": {
          "enable": true,
          "value_area": 800
        }
      },
      "color": {
        "value": "#00ffcc"
      },
      "shape": {
        "type": "circle"
      },
      "opacity": {
        "value": 0.6,
        "random": true,
        "anim": {
          "enable": false
        }
      },
      "size": {
        "value": 2,
        "random": true,
        "anim": {
          "enable": false
        }
      },
      "line_linked": {
        "enable": false
      },
      "move": {
        "enable": true,
        "speed": 3,
        "direction": "bottom",
        "straight": false,
        "out_mode": "out",
        "bounce": false
      }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": {
        "onhover": {
          "enable": false
        },
        "onclick": {
          "enable": false
        },
        "resize": true
      }
    },
    "retina_detect": true
  });
};
document.body.appendChild(script);
