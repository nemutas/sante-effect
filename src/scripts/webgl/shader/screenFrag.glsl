struct TextureData {
  sampler2D texture;
  vec2 uvScale;
};

uniform TextureData u_image;
varying vec2 v_uv;

vec4 getTexture(TextureData data) {
  vec2 uv = (v_uv - 0.5) * data.uvScale + 0.5;
  return texture2D(data.texture, uv);
}

void main() {
  vec4 tex = getTexture(u_image);

  gl_FragColor = tex;
}