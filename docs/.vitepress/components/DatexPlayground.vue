<template>
  <div class="playground-container">
    <client-only>
      <div class="editor-container" :style="{ height: editorHeight + 'px' }">
        <VueMonacoEditor
          v-model:value="code"
          :language="language"
          :theme="currentTheme === 'dark' ? 'customDark' : 'customLight'"
          :options="editorOptions"
          @mount="handleEditorMount"
        />
      </div>  
    </client-only>

    <div class="controls">
      <button @click="executeCode" :disabled="isRunning" class="run-button">
        {{ isRunning ? 'Running...' : 'Run DATEX Code' }}
      </button>
    </div>
    
    <div class="console-output" v-if="hasExecuted">
      <div class="console-header">Console Output</div>
      <pre><code ref="console" class="console-content"></code></pre>
    </div>
  </div>
</template>

<script>
import { ref, shallowRef, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import AnsiToHtml from 'ansi-to-html'

export default {
  name: 'DatexPlayground',
  components: {
    VueMonacoEditor
  },
  props: {
    code: {
      type: String,
    },
    editorId: {
      type: String,
      required: false
    }
  },
  setup(props) {
    const code = ref(props.code)
    const isRunning = ref(false)
    const consoleRef = ref(null)
    const hasExecuted = ref(false)
    const editorRef = shallowRef(null)
    const currentTheme = ref('light')
    const language = ref('javascript')
    const editorHeight = ref(60)
    const ansiConverter = new AnsiToHtml()
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    }
    
    const editorOptions = {
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbersMinChars: 3,
      wordWrap: 'on',
      lineNumbers: 'on',
      scrollbar: {
        vertical: 'hidden',
        horizontal: 'hidden',
        handleMouseWheel: false
      },
      overviewRulerLanes: 0,
      hideCursorInOverviewRuler: true,
      overviewRulerBorder: false
    }

    const calculateEditorHeight = () => {
      if (!editorRef.value) return
      
      const lineHeight = 19
      const padding = 20
      const lineCount = Math.max(1, code.value.split('\n').length)
      const minHeight = lineHeight + padding
      const maxHeight = 400
      
      const calculatedHeight = Math.min(maxHeight, Math.max(minHeight, lineCount * lineHeight + padding))
      
      editorHeight.value = calculatedHeight
      
      nextTick(() => {
        if (editorRef.value) {
          editorRef.value.layout()
        }
      })
    }

    const handleEditorMount = (editor, monaco) => {
      editorRef.value = editor
      
      monaco.editor.defineTheme('customDark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '6a9955' },
          { token: 'keyword', foreground: '569cd6' },
          { token: 'string', foreground: 'ce9178' },
        ],
        colors: {
          'editor.background': '#161618',
          'editor.lineHighlightBackground': '#2d2d30',
        }
      })

      monaco.editor.defineTheme('customLight', {
        base: 'vs',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '008000' },
          { token: 'keyword', foreground: '0000ff' }
        ],
        colors: {
          'editor.background': '#ffffff'
        }
      })
      
      updateEditorTheme()
      calculateEditorHeight()
      
      editor.onDidChangeModelContent(() => {
        calculateEditorHeight()
      })
      setTimeout(() => {
        editor.getModel()?.setValue(code.value)
        calculateEditorHeight()
      }, 100)
    }

    const detectTheme = () => {
      const isDark = document.documentElement.classList.contains('dark')
      currentTheme.value = isDark ? 'dark' : 'light'
      updateEditorTheme()
    }

    const watchThemeChanges = () => {
      const observer = new MutationObserver(() => {
        detectTheme()
      })
      
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      })
      
      return observer
    }

    const updateEditorTheme = () => {
      if (editorRef.value) {
        const theme = currentTheme.value === 'dark' ? 'customDark' : 'customLight'
        editorRef.value.updateOptions({ theme })
      }
    }

    const executeCode = async () => {
      hasExecuted.value = true
      isRunning.value = true
      clearConsole()

      console.log = consoleInterceptor('log')
      console.error = consoleInterceptor('error')
      console.warn = consoleInterceptor('warn')
      console.info = consoleInterceptor('info')

      try {
        if (!window.Datex) {
          throw new Error("DATEX not loaded")
        }

        const result = await Datex.execute(code.value, true)
        if (result !== undefined) console.log(result)

      } catch (error) {
        console.error('Error:', error)
      } finally {
        console.log = originalConsole.log
        console.error = originalConsole.error
        console.warn = originalConsole.warn
        console.info = originalConsole.info
        isRunning.value = false
      }
    }

    const consoleInterceptor = (type) => {
    return (...args) => {
      originalConsole[type](...args)

        const filteredMessages = [
          'Logger initialized!',
          'Runtime initialized - Version',
          'Ignoring Event: localhost'
        ]

      const joinedArgs = args.join(' ')
        if (filteredMessages.some(msg => joinedArgs.includes(msg))) {
          return
        }

      const formattedArgs = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2)
          } catch {
            return String(arg)
          }
        }
        return String(arg)
      }).join(' ')

      if (consoleRef.value) {
        const message = document.createElement('div')
        message.className = `console-message console-${type}`
        message.innerHTML = ansiConverter.toHtml(formattedArgs)
        consoleRef.value.appendChild(message)
        consoleRef.value.scrollTop = consoleRef.value.scrollHeight
      }
    }
  }

    const clearConsole = () => {
      if (consoleRef.value) {
        consoleRef.value.innerHTML = ''
      }
    }

    watch(() => props.code, (newCode) => {
      code.value = newCode
      nextTick(() => {
        calculateEditorHeight()
      })
    }, { immediate: true })

    watch(code, () => {
      nextTick(() => {
        calculateEditorHeight()
      })
    })

    onMounted(() => {
      detectTheme()
      const observer = watchThemeChanges()

      nextTick(() => {
        calculateEditorHeight()
      })
      
      return () => {
        observer.disconnect()
      }
    })

    onBeforeUnmount(() => {
      console.log = originalConsole.log
      console.error = originalConsole.error
      console.warn = originalConsole.warn
      console.info = originalConsole.info
    })

    return {
      code,
      isRunning,
      console: consoleRef,
      currentTheme,
      language,
      editorOptions,
      hasExecuted,
      editorHeight,
      executeCode,
      handleEditorMount,
    }
  }
}
</script>

<style scoped>
.playground-container {
  margin: 30px 0;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-code-block-bg);
  overflow: hidden;
}

.editor-container {
  min-height: 39px;
  max-height: 400px;
  overflow: hidden;
  transition: height 0.2s ease-out;
}

.controls {
  padding: 10px;
  border-top: 1px solid var(--vp-c-divider);
  flex-shrink: 0;
}

.run-button {
  background: var(--vp-c-brand);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.run-button:hover:not(:disabled) {
  opacity: 0.9;
}

.run-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.console-output {
  border-top: 1px solid var(--vp-c-divider);
  padding: 0;
  overflow-y: auto;
  resize: vertical;
  min-height: 100px;
  max-height: 400px;
  flex-shrink: 0;
}

.console-header {
  padding: 8px 16px;
  font-weight: 600;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 14px;
}

.console-content {
  display: block;
  padding: 10px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  line-height: 1.4;
}

.console-message {
  margin: 2px 0;
  padding: 1px 0;
}

.console-error { 
  color: #ff4d4f;
  font-weight: 500;
}

.console-warn { 
  color: #faad14;
  font-weight: 500;
}

.console-log {
  color: var(--vp-c-text-1);
}

.console-info {
  color: var(--vp-c-text-2);
}
</style>