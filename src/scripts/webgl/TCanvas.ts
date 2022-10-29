import * as THREE from 'three'
import { resolvePath } from '../utils'
import { Assets, loadAssets } from './assetLoader'
import { FragmentPlane } from './FragmentPlane'
import { mouse2d } from './mouse2d'
import planeFragmentFrag from './shader/planeFragmentFrag.glsl'
import planeFragmentVert from './shader/planeFragmentVert.glsl'
import screenFrag from './shader/screenFrag.glsl'
import screenVert from './shader/screenVert.glsl'
import { TCanvasBase } from './TCanvasBase'

export class TCanvas extends TCanvasBase {
	private renderTarget!: THREE.WebGLRenderTarget
	private fragmentPlanes: FragmentPlane[] = []
	// mouse operation related properties
	private lookTarget = new THREE.Vector3()
	private speed = 0

	private assets: Assets = {
		image: { path: resolvePath('resources/image.jpg') },
	}

	constructor(parentNode: ParentNode) {
		super(parentNode)

		loadAssets(this.assets).then(() => {
			this.setScene()
			this.setResizeCallback()
			this.createScreen()
			this.createFragmentPlane()
			this.animate(this.update)
		})
	}

	private setScene() {
		this.scene.background = new THREE.Color('#000')
		this.camera.position.z = 5

		this.renderTarget = new THREE.WebGLRenderTarget(this.size.width, this.size.height, {
			wrapS: THREE.MirroredRepeatWrapping,
			wrapT: THREE.MirroredRepeatWrapping,
		})
	}

	private setResizeCallback() {
		this.resizeCallback = () => {
			// update screen
			const screen = this.getMesh<THREE.ShaderMaterial>('screen')
			const screenSize = this.calcScreenSize(screen.position.z)
			screen.scale.set(screenSize.width, screenSize.height, 1).multiplyScalar(1.1)
			const screenUnifromImage = screen.material.uniforms.u_image.value
			this.calcCoveredTextureScale(screenUnifromImage.texture, this.size.aspect, screenUnifromImage.uvScale)

			// update fragment screen
			const screenCoord = this.calcScreenCoord()
			this.fragmentPlanes.forEach(plane => plane.resize(this.calcScreenSize(plane.z).height, screenCoord))
		}
	}

	private calcScreenSize(offsetZ = 0) {
		const camera = this.camera as THREE.PerspectiveCamera
		const fovRadian = (camera.fov / 2) * (Math.PI / 180)
		const screenHeight = (camera.position.z - offsetZ) * Math.tan(fovRadian) * 2
		const screenWidth = screenHeight * this.size.aspect
		return { width: screenWidth, height: screenHeight }
	}

	private calcScreenCoord() {
		const { width, height } = this.size
		return new THREE.Vector2(width, height).multiplyScalar(window.devicePixelRatio)
	}

	private get texture() {
		return this.assets.image.data as THREE.Texture
	}

	private getMesh<T extends THREE.Material>(name: string) {
		return this.scene.getObjectByName(name) as THREE.Mesh<THREE.BufferGeometry, T>
	}

	private createScreen() {
		const geometry = new THREE.PlaneGeometry()
		const material = new THREE.ShaderMaterial({
			uniforms: {
				u_image: {
					value: { texture: this.texture, uvScale: this.calcCoveredTextureScale(this.texture, this.size.aspect) },
				},
			},
			vertexShader: screenVert,
			fragmentShader: screenFrag,
		})
		const mesh = new THREE.Mesh(geometry, material)
		mesh.position.z = -1
		const { width, height } = this.calcScreenSize(mesh.position.z)
		mesh.scale.set(width, height, 1).multiplyScalar(1.1)
		mesh.name = 'screen'
		this.scene.add(mesh)
	}

	private createFragmentPlane() {
		const material = new THREE.ShaderMaterial({
			uniforms: {
				u_texture: { value: null },
				u_screenCoord: { value: this.calcScreenCoord() },
				u_offset: { value: new THREE.Vector2(0, 0) },
			},
			vertexShader: planeFragmentVert,
			fragmentShader: planeFragmentFrag,
		})

		const fragmentCount = 30
		const screenWidth = this.calcScreenSize().width
		;[...Array(fragmentCount)].forEach((_, i) => {
			const x = screenWidth * (i / fragmentCount) - screenWidth / 2
			const z = (i / fragmentCount) * 0.001
			this.fragmentPlanes.push(new FragmentPlane(this.scene, material.clone(), this.calcScreenSize(z).height, x, z))
		})
	}

	private update = () => {
		// calc mouse potion, speed
		const screenSize = this.calcScreenSize()
		let x = mouse2d.position.x * (screenSize.width / 2)
		let y = mouse2d.position.y * (screenSize.height / 2)
		x *= 0.15
		y *= 0.15
		const screen = this.getMesh('screen')
		screen.lookAt(this.lookTarget.set(x, y, 10))

		const mouseSpeed = Math.abs(this.speed - mouse2d.speed.x)
		this.speed = mouse2d.speed.x

		// update fragment plane texture
		this.fragmentPlanes.forEach(plane => (plane.visible = false))

		this.renderer.setRenderTarget(this.renderTarget)
		this.renderer.render(this.scene, this.camera)
		this.fragmentPlanes.forEach(plane => plane.update(this.renderTarget.texture, mouseSpeed))
		this.renderer.setRenderTarget(null)

		this.fragmentPlanes.forEach(plane => (plane.visible = true))
	}

	dispose() {
		super.dispose()
		mouse2d.dispose()
	}
}
