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
    }
  },
  mounted() {
    this.loadMonacoEditor().catch(console.error);
    this.overrideConsole();
  },
  methods: {
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

      monacoEditor = monaco.editor.create(this.$refs.editor, {
        value: this.initialCode,
        language: 'typescript',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: true,
        scrollBeyondLastLine: false,
        readOnly: false
      });
    },

    async executeCode() {
      this.isRunning = true;
      this.clearConsole();
      
      try {
        const code = monacoEditor?.getValue() || this.initialCode;
        if (!window.ts) {
          throw new Error('TypeScript compiler not loaded');
        }
        
        const jsCode = window.ts.transpileModule(code, {
          compilerOptions: { module: window.ts.ModuleKind.ESNext }
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
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  overflow: hidden;
  margin: 20px 0;
}

[data-theme="dark"] .playground-container {
  border-color: #444;
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
}

.controls {
	padding: 10px;
	/* background: #f6f8fa; */
	border-top: 1px solid #e1e5e9;
	border-bottom: 1px solid #e1e5e9;
	background: #1e1e1e;
	border-color: #444;
}

/* [data-theme="dark"] .controls {
  background: #1e1e1e;
  border-color: #444;
} */

.run-button {
  background: #0969da;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.run-button:hover:not(:disabled) {
  background: #0860ca;
}

.run-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.console-output {
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

[data-theme="dark"] .console-output {
  background: #1e1e1e;
}

.console-header {
  padding: 8px 16px;
  /* background: #e1e5e9; */
  background: #333;
  color: #f0f0f0;
  font-weight: 600;
  font-size: 14px;
}

/* [data-theme="dark"] .console-header {
  background: #333;
  color: #f0f0f0;
} */

.console-content {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 13px;
  white-space: pre-wrap;
  background: #1e1e1e;
}

.console-message {
  margin: 2px 0;
  line-height: 1.4;
}

.console-log {
  color: #24292e;
}

/* [data-theme="dark"] .console-log {
  color: #f0f0f0;
} */

.console-error {
  color: #d1242f;
}

.console-warn {
  color: #d29922;
}

.console-info {
  color: #0969da;
}
</style>