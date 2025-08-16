uniform float uTime;
uniform vec3 uColor;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float distanceToCenter = length(coord);
  
  // High-quality smooth falloff for better anti-aliasing
  float innerGlow = 1.0 - smoothstep(0.0, 0.3, distanceToCenter);
  float outerGlow = 1.0 - smoothstep(0.1, 0.5, distanceToCenter);
  
  // Create multiple glow layers for higher quality
  float coreGlow = 1.0 - smoothstep(0.0, 0.15, distanceToCenter);
  float midGlow = 1.0 - smoothstep(0.1, 0.35, distanceToCenter);
  float softGlow = 1.0 - smoothstep(0.2, 0.5, distanceToCenter);
  
  // Combine layers with different intensities
  float finalStrength = 
    coreGlow * 0.8 +           // Bright core
    midGlow * 0.4 +            // Medium glow
    softGlow * 0.2;            // Soft outer glow
  
  // Add subtle pulsing effect
  float pulse = sin(uTime * 2.0) * 0.1 + 0.9;
  finalStrength *= pulse;
  
  // Smooth edge fade-out for better anti-aliasing
  finalStrength *= 1.0 - smoothstep(0.45, 0.5, distanceToCenter);
  
  gl_FragColor = vec4(uColor, finalStrength);
}