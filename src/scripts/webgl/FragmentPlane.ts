import gsap from 'gsap'
import * as THREE from 'three'

export class FragmentPlane {
	private mesh!: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>
	private isAnimate = false

	constructor(
		private scene: THREE.Scene,
		private material: THREE.ShaderMaterial,
		private height: number,
		private x: number,
		public z: number,
	) {
		this.createMesh()
	}

	private createMesh() {
		const geometry = new THREE.PlaneGeometry()
		this.mesh = new THREE.Mesh(geometry, this.material)
		this.mesh.position.set(this.x, 0, this.z)
		this.mesh.scale.set(1, this.height, 1)
		this.mesh.userData.position = this.mesh.position.clone()
		this.scene.add(this.mesh)
	}

	private aniamtion(mouseSpeed: number) {
		// Conditions for executing animation
		const threshold = 0.001 + Math.min(0.01, mouseSpeed)
		if (this.isAnimate || threshold < Math.random()) return

		// Execution of animation
		this.isAnimate = true

		const random = (min: number, max?: number) => {
			const _min = max ? min : -min
			const _max = max ? max : min
			return Math.random() * (_max - _min) + _min
		}

		const x = this.mesh.userData.position.x
		const offset = this.mesh.material.uniforms.u_offset.value

		const tl = gsap.timeline({
			defaults: { duration: 0.5, ease: 'power3.out' },
			onComplete: () => {
				this.isAnimate = false
			},
		})
		tl.fromTo(offset, { x: 0, y: 0 }, { x: random(0.2), y: random(0.05), ease: 'power2.inOut' })
		tl.fromTo(this.mesh.position, { x }, { x: () => x + random(0.3 + mouseSpeed) }, '<')
		tl.to(offset, { x: 0, y: 0, ease: 'power2.inOut' })
		tl.fromTo(this.mesh.scale, { x: random(0, 0.3) }, { x: random(0, 0.3) }, '<50%')
		tl.to(this.mesh.position, { x }, '<10%')
	}

	set visible(v: boolean) {
		this.mesh.visible = v
	}

	resize(height: number, screenCoord: THREE.Vector2) {
		this.mesh.scale.y = height
		this.mesh.material.uniforms.u_screenCoord.value.copy(screenCoord)
	}

	update(texture: THREE.Texture, mouseSpeed: number) {
		this.mesh.material.uniforms.u_texture.value = texture
		this.aniamtion(mouseSpeed)
	}
}
