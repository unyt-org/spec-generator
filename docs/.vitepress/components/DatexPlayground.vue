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
    const editorHeight = ref(300)
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
      wordWrap: 'on'
    }

    const calculateEditorHeight = () => {
      if (!editorRef.value) return
      
      const lineHeight = 19
      const padding = 20 
      const lineCount = code.value.split('\n').length
      const calculatedHeight = Math.max(300, lineCount * lineHeight + padding)
      
      editorHeight.value = calculatedHeight
      
      nextTick(() => {
        editorRef.value?.layout()
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

        const result = await Datex.execute(code.value)
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
          return arg
        }).join(' ')

        if (consoleRef.value) {
          const message = document.createElement('div')
          message.className = `console-message console-${type}`
          message.textContent = formattedArgs
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

    onMounted(() => {
      detectTheme()
      const observer = watchThemeChanges()
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
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-code-block-bg);
}

.editor-container {
  min-height: 300px;
  overflow: hidden;
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
}

.console-error { color: #ff4d4f }
.console-warn { color: #faad14 }
</style>