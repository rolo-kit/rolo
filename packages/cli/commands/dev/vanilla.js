import fs from 'fs-extra'
import path from 'path'
import chokidar from 'chokidar'
import esbuild from 'esbuild'

export default async function vanillaDev() {
  console.log('🚀 Starting dev server for Vanilla JS project...')

  const cwd = process.cwd()
  const srcDir = path.join(cwd, 'src')
  const publicDir = path.join(cwd, 'public')
  const distDir = path.join(cwd, 'dist')

  await buildAll()

  chokidar.watch([srcDir, publicDir]).on('change', async (changedPath) => {
    console.log(`🔄 Detected change in ${changedPath}`)
    await buildAll()
  })

  async function buildAll() {
    await fs.remove(distDir)
    await fs.copy(publicDir, distDir)

    try {
      await esbuild.build({
        entryPoints: [path.join(srcDir, 'index.js')],
        bundle: true,
        minify: true,
        outfile: path.join(distDir, 'index.js'),
      })
      console.log('✅ Build complete')
    } catch (err) {
      console.error('❌ Build failed:', err.message)
    }
  }
}
