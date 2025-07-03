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
      const isDark = document.documentElement.classList.contains('dark') || 
                     document.documentElement.getAttribute('data-theme') === 'dark' ||
                     document.body.classList.contains('dark') ||
                    
                     getComputedStyle(document.documentElement).getPropertyValue('--vp-c-bg').includes('1e1e1e');
      
      const newTheme = isDark ? 'dark' : 'light';
      
      if (this.currentTheme !== newTheme) {
        this.currentTheme = newTheme;
        this.updateEditorTheme();
      }
    },

    watchThemeChanges() {
      this.themeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && 
              (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme')) {
            this.detectTheme();
          }
        });
      });

      this.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme']
      });

      const bodyObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            this.detectTheme();
          }
        });
      });

      bodyObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
      });

      this.observers = [this.themeObserver, bodyObserver];
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
          { token: 'number', foreground: 'b5cea8' },
        ],
        colors: {
          'editor.background': '#161618',
          'editor.foreground': '#d4d4d4',
          'editor.lineHighlightBackground': '#2d2d30',
          'editor.lineHighlightBorder': '#2d2d30',
          'editorLineNumber.foreground': '#6a6a6a',
          'editorLineNumber.activeForeground': '#ffffff',
          'editor.selectionBackground': '#264f78',
          'editor.selectionHighlightBackground': '#add6ff26'
        }
      });

      monaco.editor.defineTheme('customLight', {
        base: 'vs',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '008000' },
          { token: 'keyword', foreground: '0000ff' },
          { token: 'string', foreground: 'a31515' },
          { token: 'number', foreground: '098658' },
        ],
        colors: {
          'editor.background': '#ffffff',
          'editor.foreground': '#000000',
          'editor.lineHighlightBackground': '#f0f0f0',
          'editor.lineHighlightBorder': '#f0f0f0',
          'editorLineNumber.foreground': '#237893',
          'editorLineNumber.activeForeground': '#0b216f',
          'editor.selectionBackground': '#add6ff',
          'editor.selectionHighlightBackground': '#add6ff40'
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
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: true,
        scrollBeyondLastLine: false,
        readOnly: false,
        tabSize: 2,
        insertSpaces: true
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
  overflow: hidden;
  margin: 20px 0;
  background-color: var(--vp-code-block-bg);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.2s ease;
}

.editor-container {
  flex: 1;
  min-height: 300px;
  position: relative; 
}

.editor {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: var(--vp-code-block-bg);
}

.controls {
  padding: 10px;
  border-top: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
  background-color: var(--vp-code-block-bg);
  transition: all 0.2s ease;
}

.run-button {
  background: var(--vp-c-brand);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.run-button:hover:not(:disabled) {
  background: var(--vp-c-brand-dark);
}

.run-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.console-output {
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  background-color: var(--vp-code-block-bg);
  transition: all 0.2s ease;
}

.console-header {
  padding: 8px 16px;
  background-color: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  font-weight: 600;
  font-size: 14px;
  border-top: 1px solid var(--vp-c-divider);
  transition: all 0.2s ease;
}

.console-content {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  white-space: pre-wrap;
  background-color: var(--vp-code-block-bg);
  color: var(--vp-c-text-code);
  transition: all 0.2s ease;
}

.console-message {
  margin: 2px 0;
  line-height: 1.4;
}

.console-log {
  color: var(--vp-c-text-1);
}

.console-error {
  color: var(--vp-c-red);
}

.console-warn {
  color: var(--vp-c-yellow);
}

.console-info {
  color: var(--vp-c-brand);
}

.dark .playground-container {
  border-color: var(--vp-c-divider);
}

.dark .console-content {
  scrollbar-width: thin;
  scrollbar-color: var(--vp-c-divider) transparent;
}

.dark .console-content::-webkit-scrollbar {
  width: 6px;
}

.dark .console-content::-webkit-scrollbar-track {
  background: transparent;
}

.dark .console-content::-webkit-scrollbar-thumb {
  background-color: var(--vp-c-divider);
  border-radius: 3px;
}
</style>