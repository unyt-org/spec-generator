<template>
  <div class="playground-container">
    <client-only>
      <div class="editor-container" :style="{ height: editorHeight + 'px' }">
        <VueMonacoEditor
          v-model:value="code"
          :theme="currentTheme === 'dark' ? 'customDark' : 'customLight'"
          :options="editorOptions"
          @mount="handleEditorMount"
        />
      </div>  
    </client-only>

    <div class="controls">
      <div class="runtime-info">
        <div v-if="endpoint">Endpoint: <b style="user-select: all;">{{ endpoint }}</b></div>
        <div v-if="version">Version: <b style="user-select: all;">{{ version.datex }} (datex-core-js: {{ version.js }})</b></div>
        <div>
          <label class="nightly-toggle">
            <input type="checkbox" v-model="useNightly" />
            Use nightly release<span v-if="version?.commit"> (<b style="user-select: all;"><a target="_blank" :href="`https://github.com/unyt-org/datex-core-js/commit/${version.commit}`">{{ version.commit }}</a></b>)</span>
          </label>
        </div>
      </div>
      <button @click="executeCode" :disabled="isRunning" class="run-button">
        {{ isRunning ? 'Running...' : 'Run DATEX Code' }}
      </button>
    </div>
    
    <div class="console-output" v-if="results.length">
      <div class="console-header">
        <div>Result</div>
        <button @click="results = []" class="clear-console-button">Clear</button>
      </div>
      <div class="console-content">
        <div v-for="(result, index) in results" :key="index">
          <span v-if="result.startsWith('Error:')" class="console-error" v-html="ansiConverter.toHtml(result)"></span>
          <span v-else class="console-log" v-html="ansiConverter.toHtml(result || 'An error occurred')"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script type="ts">
import { ref, shallowRef, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import AnsiToHtml from 'ansi-to-html'
import { Runtime } from '@unyt/datex';

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
    const editorRef = shallowRef(null)
    const currentTheme = ref('light')
    const editorHeight = ref(60)
    const ansiConverter = new AnsiToHtml();
    const results = ref([]);
    const endpoint = ref(null);
    const version = ref(null);

    const useNightly = ref(false);

    // use nightly if url contains ?nightly
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('nightly')) {
        useNightly.value = true;
      }
    }

    // on toggle useNightly, reload the page to load the correct version
    watch(useNightly, () => {
      const url = new URL(window.location.href);
      if (useNightly.value) {
        url.searchParams.set('nightly', 'true');
      } else {
        url.searchParams.delete('nightly');
      }
      window.location.href = url.toString();
    })

    const runtimePromise = globalThis.window && (useNightly.value ? loadDatexNightly() : loadDatexStable());

    async function loadDatexNightly() {
      console.log("Using nightly release of DATEX")
      const mod = await import('https://unyt-org.github.io/datex-web/datex.js');
      // get commit hash
      const commitHash = await fetch('https://unyt-org.github.io/datex-web/commit-hash.txt')
        .then(res => res.ok ? res.text() : null)
        .then(text => text?.trim())
        .catch(() => null);
        console.log(commitHash)
      const runtime = await initRuntime(mod.Runtime, commitHash);

      return runtime;
    }

    async function loadDatexStable() {
      const runtime = await initRuntime(Runtime, null);
      return runtime;
    }

    async function initRuntime(runtimeClass, commitHash) {
      const defaultConfig = {
        interfaces: [{
            type: "websocket-client",
            config: { url: "wss://example.unyt.land" },
        }],
      };

      const runtime = await runtimeClass.create(defaultConfig, {
          log_level: 'info',
      });

      endpoint.value = runtime.endpoint;
      version.value = {
        datex: runtime.version,
        js: runtime.js_version,
        commit: commitHash
      };
      globalThis.Datex = runtime;
      return runtime;
    }

    
    const editorOptions = {
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 15,
      // language
      lineNumbersMinChars: 2,
      wordWrap: 'on',
      lineNumbers: 'on',
      scrollbar: {
        vertical: 'hidden',
        horizontal: 'hidden',
        handleMouseWheel: false
      },
      renderLineHighlight: 'none',
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

      const Datex = await runtimePromise;
      console.log('DATEX runtime', Datex)

      isRunning.value = true

      try {
        console.log('Executing code:', code.value)
        const result = await Datex.executeWithStringResult(code.value, [], {formatted: true, colorized: true})
        console.log('Execution result:', result)
        results.value.push(result)
      } catch (error) {
        console.error('Error:', error)
        results.value.push(`Error: ${error.message}`)
      } finally {
        isRunning.value = false
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


    return {
      code,
      isRunning,
      console: consoleRef,
      currentTheme,
      editorOptions,
      editorHeight,
      executeCode,
      handleEditorMount,
      results,
      ansiConverter,
      endpoint,
      version,
      useNightly
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
  /* transition: height 0.2s ease-out; */
  padding-top: 8px;
}

.controls {
  padding: 10px;
  border-top: 1px solid var(--vp-c-divider);
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
}

.run-button {
  background: #eee;
  color: #111;
  font-weight: 500;
  padding: 8px 15px;
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

.runtime-info {
  opacity: 0.8;
  line-height: 1.3;
}

.console-output {
  border-top: 1px solid var(--vp-c-divider);
  padding: 0;
  resize: vertical;
  max-height: 400px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.console-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 15px;
  font-weight: 600;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 15px;
}

.console-content {
  display: block;
  padding: 10px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 15px;
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

.nightly-toggle input {
  margin-left: 0;
}
</style>