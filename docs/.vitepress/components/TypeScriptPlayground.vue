<template>
  <div class="playground-container">
    <div class="editor-container">
      <div id="monaco-editor" ref="editor" class="editor"></div>
    </div>
    
    <div class="controls">
      <button @click="executeCode" :disabled="isRunning" class="run-button">
        {{ isRunning ? 'Running...' : 'Run Code' }}
      </button>
    </div>
    
    <div class="console-output">
      <div class="console-header">Console Output</div>
      <div ref="console" class="console-content"></div>
    </div>
  </div>
</template>

<script>
let monacoLoaded = false;
let monacoEditor = null;

export default {
  name: 'TypeScriptPlayground',
  props: {
    initialCode: {
      type: String,
      default: `// TypeScript Code Here`
    }
  },
  data() {
    return {
      isRunning: false,
      output: '',
      currentTheme: 'light'
    }
  },
  mounted() {
    this.loadMonacoEditor().catch(console.error);
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
        value: this.initialCode,
        language: 'typescript',
        theme: initialTheme,
        automaticLayout: true,
        minimap: { enabled: false },
      });

      setTimeout(() => {
        this.detectTheme();
        this.updateEditorTheme();
      }, 200);
    },

    async executeCode() {
      this.isRunning = true;
      this.clearConsole();
      
      try {
        const code = monacoEditor?.getValue() || this.initialCode;
        
        if (!window.ts) {
          await this.loadTypeScript();
        }
        
        const jsCode = window.ts.transpileModule(code, {
          compilerOptions: { 
            module: window.ts.ModuleKind.ESNext,
            target: window.ts.ScriptTarget.ES2020
          }
        }).outputText;
        
        const fn = new Function(`
          "use strict";
          try {
            ${jsCode}
          } catch(e) {
            console.error('Execution error:', e);
          }
        `);
        fn();
        
      } catch (error) {
        console.error('Error:', error);
      } finally {
        this.isRunning = false;
      }
    },

    async loadTypeScript() {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/typescript/4.9.5/typescript.min.js';
        script.onload = resolve;
        document.head.appendChild(script);
      });
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

        const joinedArgs = args.join(' ');
        if (joinedArgs.includes('Ignoring Event: localhost')) {
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
  flex: 0 0 150px;
  border-top: 1px solid var(--vp-c-divider);
}

.console-header {
  padding: 8px 16px;
  font-weight: 600;
}

.console-content {
  padding: 10px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 13px;
}

.console-error { color: #ff4d4f }
.console-warn { color: #faad14 }
</style>