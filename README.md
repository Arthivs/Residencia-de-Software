````markdown
# React + TypeScript + Vite

Este template fornece uma configuração mínima para usar **React** com **Vite**, incluindo **HMR (Hot Module Replacement)** e algumas regras básicas do **ESLint**.

Atualmente, dois plugins oficiais estão disponíveis para integração com React:

- [`@vitejs/plugin-react`](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) – utiliza o [Babel](https://babeljs.io/) para Fast Refresh
- [`@vitejs/plugin-react-swc`](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) – utiliza o [SWC](https://swc.rs/) para Fast Refresh

---

## Executando o projeto

Alguns comandos comuns (caso ainda não estejam no README):

- Instalar dependências:

```bash
npm install
# ou
yarn
# ou
pnpm install
````

* Rodar em ambiente de desenvolvimento:

```bash
npm run dev
```

* Build para produção:

```bash
npm run build
```

* Visualizar o build:

```bash
npm run preview
```

---

## Expandindo a configuração do ESLint

Se você estiver desenvolvendo uma aplicação para produção, é recomendável atualizar a configuração do ESLint para habilitar regras que levam em conta os **tipos do TypeScript** (type-aware lint rules).

Exemplo de configuração utilizando `@typescript-eslint` (tseslint):

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Outras configs...

      // Remover tseslint.configs.recommended e substituir por:
      ...tseslint.configs.recommendedTypeChecked,
      // Opcionalmente, use esta para regras mais rígidas:
      ...tseslint.configs.strictTypeChecked,
      // Opcionalmente, adicione esta para regras de estilo:
      ...tseslint.configs.stylisticTypeChecked,

      // Outras configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // outras opções...
    },
  },
])
```

### Explicação rápida

* `recommendedTypeChecked`
  Ativa regras recomendadas que utilizam o sistema de tipos do TypeScript.

* `strictTypeChecked`
  Deixa as regras mais rígidas, ajudando a capturar mais erros em tempo de desenvolvimento, mas pode exigir mais ajustes no código.

* `stylisticTypeChecked`
  Inclui regras relacionadas a **estilo de código** (formatação, convenções, etc.), também considerando os tipos.

* `parserOptions.project`
  Aponta para os arquivos de configuração do TypeScript usados no projeto (`tsconfig.node.json` e `tsconfig.app.json`).

* `tsconfigRootDir`
  Define o diretório raiz do `tsconfig`, utilizando `import.meta.dirname` como referência.


## Regras específicas para React (ESLint Plugins)

Você também pode instalar os plugins:

* [`eslint-plugin-react-x`](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x)
* [`eslint-plugin-react-dom`](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom)

Eles fornecem regras específicas para **React** e **React DOM**.

Exemplo de configuração no `eslint.config.js`:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Outras configs...

      // Ativa regras de lint para React
      reactX.configs['recommended-typescript'],
      // Ativa regras de lint para React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // outras opções...
    },
  },
])
```

### Benefícios desses plugins

* Garantem boas práticas no uso de **componentes React**.
* Ajudam a evitar padrões problemáticos no uso de **React DOM** (como manipulação incorreta de elementos, eventos, etc.).
* Melhoram a qualidade do código e manutenção da base.


## Estrutura típica do projeto (sugestão de seção)

Uma estrutura comum de projeto criado com React + TypeScript + Vite:

```text
.
├── node_modules/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.app.json
├── tsconfig.node.json
├── tsconfig.json
├── vite.config.ts
└── eslint.config.js
```


## Tecnologias principais usadas

* **Vite** – Ferramenta de build rápida para desenvolvimento moderno com ES Modules.
* **React** – Biblioteca para construção de interfaces de usuário.
* **TypeScript** – Superset do JavaScript que adiciona tipagem estática.
* **ESLint** – Ferramenta para padronização e verificação de qualidade do código.



```
```
