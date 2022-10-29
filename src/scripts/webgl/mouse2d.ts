export class Mouse2D {
	private static mouse2d?: Mouse2D
	private _position: [number, number] = [0, 0]
	private prevPosition: [number, number] = [0, 0]

	static get instance() {
		if (!this.mouse2d) {
			this.mouse2d = new Mouse2D()
		}
		return this.mouse2d
	}

	private constructor() {
		window.addEventListener('mousemove', this.handleMouseMove)
		window.addEventListener('touchmove', this.handleTouchMove)
	}

	private handleMouseMove = (e: MouseEvent) => {
		this.prevPosition = this._position
		const x = (e.clientX / window.innerWidth) * 2 - 1
		const y = -1 * ((e.clientY / window.innerHeight) * 2 - 1)
		this._position = [x, y]
	}

	private handleTouchMove = (e: TouchEvent) => {
		this.prevPosition = this._position
		const { pageX, pageY } = e.touches[0]
		const x = (pageX / window.innerWidth) * 2 - 1
		const y = -1 * ((pageY / window.innerHeight) * 2 - 1)
		this._position = [x, y]
	}

	get position() {
		return { x: this._position[0], y: this._position[1] }
	}

	get speed() {
		return { x: this._position[0] - this.prevPosition[0], y: this._position[0] - this.prevPosition[0] }
	}

	dispose() {
		window.removeEventListener('mousemove', this.handleMouseMove)
		window.removeEventListener('touchmove', this.handleTouchMove)
		Mouse2D.mouse2d = undefined
	}
}

export const mouse2d = Mouse2D.instance
