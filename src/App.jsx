import { useEffect } from 'react'
import { Application, Assets, Sprite, Text } from 'pixi.js'

import gsap from "gsap"

import heroImage from './assets/hero.png'
import enemyImage from './assets/enemy.png'
import cartridgeImage from './assets/cartridge.png'

function Container({children}) {
  return (
    <div className='w-screen h-screen c'>
      {children}
    </div>
  )
}

const windowWidth = window.screen.width
const windowHeight = window.screen.height

let text = null
let count = 0

let enemies = []
let cartridges = []

const initScene = (selector) => {
  const app = new Application({
    width: windowWidth,
    height: windowHeight,
    backgroundColor: "#E0E7FF"
  })

  const container = document.querySelector(selector)
  container.appendChild(app.view)
  
  return app
}

const initHero = async (app) => {
  const texture = await Assets.load(heroImage)
  const hero = new Sprite(texture);

  hero.x = app.renderer.width / 2 - hero.width / 2;
  hero.y = app.renderer.height - hero.height;

  app.stage.addChild(hero);
  return hero
}

function detectCollision(rect1, rect2) {
  if (rect1.x < rect2.x + rect2.width &&
     rect1.x + rect1.width > rect2.x &&
     rect1.y < rect2.y + rect2.height &&
     rect1.height + rect1.y > rect2.y) {
        // 矩形相交，发生碰撞
        return true;
    }
  else {
        // 矩形不相交，未发生碰撞
        return false;
    }
}

const createCartridge = async (app, {x, y}) => {
  const texture = await Assets.load(cartridgeImage)
  const cartridge = new Sprite(texture);

  cartridge.width = 50
  cartridge.height = 50

  cartridge.x = x
  cartridge.y = y

  const timer = setInterval(() => {
    gsap.to(cartridge, {
      y: cartridge.y - 20,
      direction: 100
    })

      // 碰撞检测
      enemies.some(e => {
        const result = detectCollision(cartridge, e)

        if(result) {
          app.stage.removeChild(e)
          app.stage.removeChild(cartridge)

          enemies = enemies.filter(ee => ee !== e)
          
          text.text = `当前击杀敌方：${count++}`

          clearInterval(timer)
          return true
        }
      })
  }, 10);

  app.stage.addChild(cartridge);

  return cartridge
}

const initOperation = async (app, hero) => {
  window.addEventListener('keydown', async e => {
    const {key, code} = e
    const step = 100

    const run = (key, value) => {
      gsap.to(hero, {
        [key]: value,
        direction: 3
      })
    }

    switch(key) {
      case 'ArrowUp': run('y', hero.y - step); break
      case 'ArrowDown': run('y', hero.y + step); break
      case 'ArrowLeft': run('x', hero.x - step); break
      case 'ArrowRight': run('x', hero.x + step); break
    }

    // 发射子弹
    if(code === 'Space') {
      const x = hero.x + hero.width / 2 - 27
      const y = hero.y
      await createCartridge(app, { x, y})
      await createCartridge(app, { x, y})
      await createCartridge(app, { x, y})
    }

    const result = enemies.some(e => {
      return detectCollision(hero, e)
    })

    if(result){
      alert('💥')
      location.reload()
    }
  })
}

const initEnemy = async (app, { x, y }) => {
  const texture = await Assets.load(enemyImage)
  const enemy = new Sprite(texture);

  enemy.x = x
  enemy.y = y

  enemy.width = 100
  enemy.width = 100

  app.stage.addChild(enemy);
  return enemy
}

const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const initEnemies = async (app) => {

  const len = 3

  // 初始化
  for (let index = 0; index < len; index++) {
    const max = app.renderer.width - 100

    const [x, y] = [
      randomInRange(0, max),
      0
    ] 

    const enemy = await initEnemy(app, { x, y })
    enemies.push(enemy)
  }

  // 动起来
  setInterval(() => {
    for (const e of enemies) {
      // e.y += 20
      gsap.to(e, {
        y: e.y + 20,
        direction: 1000
      })
    }
  }, 100);

}

const initContent = (app) => {
  const basicText = new Text(`当前击杀敌方：0`);
  basicText.x = 10;
  basicText.y = 10;
  app.stage.addChild(basicText);
  text = basicText
}

const init = async (selector) => {
  const app = initScene(selector)
  const hero = await initHero(app)
  await initOperation(app, hero)
  initContent(app)
  
  setInterval(async() => {
    await initEnemies(app)
  }, 1000);
}

function App() {

  useEffect(() => {
    init('.c')
  }, [])

  return (
    <Container>
        
    </Container>
  )
}

export default App