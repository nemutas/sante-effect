import GUI from 'lil-gui'

class SingletonGUI extends GUI {
	private static gui?: SingletonGUI

	static get instance() {
		if (!this.gui) this.gui = new SingletonGUI()
		return this.gui
	}

	private constructor() {
		super()
	}

	destroy() {
		super.destroy()
		SingletonGUI.gui = undefined
	}
}

export const gui = SingletonGUI.instance
