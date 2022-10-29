uniform sampler2D u_texture;
uniform vec2 u_screenCoord;
uniform vec2 u_offset;

void main() {
  vec2 uv = gl_FragCoord.xy / u_screenCoord.xy;

  vec4 tex = texture2D(u_texture, uv + u_offset);

  gl_FragColor = tex;
}