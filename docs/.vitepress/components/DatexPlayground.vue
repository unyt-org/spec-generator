<template>
  <div class="playground-container">
    <div class="editor-container">
      <div id="monaco-editor" ref="editor" class="editor"></div>
    </div>
    
    <div class="controls">
      <button @click="executeCode" :disabled="isRunning" class="run-button">
        {{ isRunning ? 'Running...' : 'Run DATEX Code' }}
      </button>
    </div>
    
    <div class="console-output">
      <div class="console-header">Console Output</div>
      <pre><code ref="console" class="console-content"></code></pre>
    </div>
  </div>
</template>

<script>
let monacoLoaded = false;
let monacoEditor = null;
let datexLoaded = false;
const editorInstances = {};

export default {
  name: 'DatexPlayground',
  props: {
  code: String,
  editorId: {
    type: String,
    required: false
  }
},
  data() {
    return {
      isRunning: false,
      output: '',
      currentTheme: 'light',
      internalEditorId: this.editorId || `editor-${Math.random().toString(36).substr(2, 8)}`
    }
  },
  mounted() {
    this.loadMonacoEditor().catch(console.error);
	this.loadDatex().catch(console.error);
    this.overrideConsole();
    
    this.$nextTick(() => {
      setTimeout(() => {
        this.detectTheme();
        this.watchThemeChanges();
      }, 100);
    });
  },
  beforeUnmount() {
    this.restoreConsole();
    if (this.observers) {
      this.observers.forEach(observer => observer.disconnect());
    }
  },
  methods: {
    detectTheme() {
      const isDark = document.documentElement.classList.contains('dark')
      const newTheme = isDark ? 'dark' : 'light';
      
      if (this.currentTheme !== newTheme) {
        this.currentTheme = newTheme;
        this.updateEditorTheme();
      }
    },

    watchThemeChanges() {
      const checkDarkMode = () => {
        this.currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        this.updateEditorTheme();
      };
      this.themeObserver = new MutationObserver(checkDarkMode);
  
      this.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
    },

    updateEditorTheme() {
      if (monacoEditor) {
        const theme = this.currentTheme === 'dark' ? 'customDark' : 'customLight';
        monaco.editor.setTheme(theme);
      }
    },

    async loadMonacoEditor() {
      if (monacoLoaded) {
        this.createEditor();
        return;
      }

      await new Promise((resolve) => {
        const loaderScript = document.createElement('script');
        loaderScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs/loader.min.js';
        loaderScript.onload = () => {
          window.require.config({
            paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' }
          });
          window.require(['vs/editor/editor.main'], () => {
            monacoLoaded = true;
            this.createEditor();
            resolve();
          });
        };
        document.head.appendChild(loaderScript);
      });
    },

    createEditor() {
      if (!this.$refs.editor) return;
      
      if (monacoEditor) {
        monacoEditor.dispose();
      }

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
      });

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
      });

      this.detectTheme();
      const initialTheme = this.currentTheme === 'dark' ? 'customDark' : 'customLight';

      monacoEditor = monaco.editor.create(this.$refs.editor, {
        value: this.code,
        language: 'javascript',
        theme: initialTheme,
        automaticLayout: true,
        minimap: { enabled: false },
      });
      editorInstances[this.internalEditorId] = monacoEditor;

      setTimeout(() => {
        this.detectTheme();
        this.updateEditorTheme();
      }, 200);
    },

    async executeCode() {
      this.isRunning = true;
      this.clearConsole();
      
      try {
        const editor = editorInstances[this.internalEditorId];
        const code = editor?.getValue() || this.code;


		
        if (!datexLoaded) {
        await this.loadDatex();
        }
          
        const result = await Datex.execute(code);
        if (result !== undefined) console.log(result);
        
		
	    }  catch (error) {
        console.error('Error:', error);
      } finally {
        this.isRunning = false;
      }
    },

    async loadDatex() {
      if (datexLoaded) return;
      
      try {
        const module = await import('https://esm.sh/@unyt/datex@0.0.4');
        Object.assign(window, module);
        datexLoaded = true;
      } catch (error) {
        console.error('Failed to load DATEX library:', error);
        throw error;
      }
    },

    overrideConsole() {
      this.originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info
      };
      
      console.log = this.consoleInterceptor('log');
      console.error = this.consoleInterceptor('error');
      console.warn = this.consoleInterceptor('warn');
      console.info = this.consoleInterceptor('info');
    },
    
    restoreConsole() {
      if (this.originalConsole) {
        console.log = this.originalConsole.log;
        console.error = this.originalConsole.error;
        console.warn = this.originalConsole.warn;
        console.info = this.originalConsole.info;
      }
    },
    
    consoleInterceptor(type) {
      return (...args) => {
        this.originalConsole[type](...args);

		const filteredMessages = [
			'Logger initialized!',
			'Runtime initialized - Version',
			'Ignoring Event: localhost'
		];

        const joinedArgs = args.join(' ');
		if (filteredMessages.some(msg => joinedArgs.includes(msg))) {
			return;
		}
        
        const formattedArgs = args.map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch {
              return String(arg);
            }
          }
          return arg;
        }).join(' ');
        
        const message = document.createElement('div');
        message.className = `console-message console-${type}`;
        message.textContent = formattedArgs;
        this.$refs.console.appendChild(message);
        this.$refs.console.scrollTop = this.$refs.console.scrollHeight;
      };
    },

    clearConsole() {
      this.$refs.console.innerHTML = '';
    }
  }
}
</script>

<style scoped>
.playground-container {
  display: flex;
  flex-direction: column;
  height: 600px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-code-block-bg);
}

.editor-container {
  flex: 1;
  min-height: 200px;
}

.editor {
  height: 100%;
}

.controls {
  padding: 10px;
  border-top: 1px solid var(--vp-c-divider);
}

.run-button {
  background: var(--vp-c-brand);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
}

.console-output {
  border-top: 1px solid var(--vp-c-divider);
  padding: 0;
  max-height: 200px;
  overflow-y: auto;
}

.console-header {
  padding: 8px 16px;
  font-weight: 600;
}

.console-content {
  display: block;
  padding: 10px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-word;
}

.console-error { color: #ff4d4f }
.console-warn { color: #faad14 }
</style>