import { expect, type Page } from '@playwright/test'

function editorRoot(page: Page) {
  return page.getByTestId('code-editor')
}

export async function waitForEditorReady(page: Page) {
  const editor = editorRoot(page)
  await expect(editor).toHaveAttribute('data-editor-engine', 'monaco')
  await expect(editor).toHaveAttribute('data-editor-ready', 'true', {
    timeout: 15_000,
  })
  await expect(editor.locator('.monaco-editor')).toBeVisible()
}

export async function setEditorCode(page: Page, code: string) {
  await waitForEditorReady(page)

  const editor = editorRoot(page)
  const usedBridge = await editor.evaluate((el, value) => {
    const host = el as HTMLElement & {
      __studioMonacoSetValue?: (nextValue: string) => void
    }
    if (typeof host.__studioMonacoSetValue === 'function') {
      host.__studioMonacoSetValue(value)
      return true
    }
    return false
  }, code)

  if (!usedBridge) {
    const clickTarget = editor.locator('.view-lines')
    if (await clickTarget.count()) {
      await clickTarget.first().click({ position: { x: 24, y: 16 } })
    } else {
      await editor.click()
    }

    await page.keyboard.press('ControlOrMeta+A')
    await page.keyboard.press('Backspace')
    await page.keyboard.insertText(code)
  }

  await expect.poll(async () => {
    return editor.evaluate((el) => {
      const host = el as HTMLElement & {
        __studioMonacoGetValue?: () => string
      }
      return typeof host.__studioMonacoGetValue === 'function'
        ? host.__studioMonacoGetValue()
        : null
    })
  }).toBe(code)
}

export async function getEditorVisibleText(page: Page) {
  await waitForEditorReady(page)

  const editor = editorRoot(page)
  const bridgedValue = await editor.evaluate((el) => {
    const host = el as HTMLElement & {
      __studioMonacoGetValue?: () => string
    }
    if (typeof host.__studioMonacoGetValue === 'function') {
      return host.__studioMonacoGetValue()
    }
    return null
  })

  if (typeof bridgedValue === 'string') return bridgedValue

  const viewLines = editor.locator('.view-lines')
  if (await viewLines.count()) {
    return (await viewLines.first().innerText()).replace(/\u00a0/g, ' ')
  }
  return ''
}
