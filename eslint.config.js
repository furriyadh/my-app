import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  {
    ignores: [
      'dist',
      'node_modules',
      '.vite',
      'coverage',
      '*.config.js',
      'public',
      '.env*',
      'pnpm-lock.yaml',
      '*.log'
    ]
  },
  
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.es2020,
        ...globals.node
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: {
          jsx: true
        },
        sourceType: 'module'
      }
    },
    
    settings: {
      react: {
        version: '18.2'
      }
    },
    
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    
    rules: {
      // JavaScript/ES6+ Rules
      ...js.configs.recommended.rules,
      
      // React Rules
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      
      // React Refresh Rules
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ],
      
      // Custom Rules
      'no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error', 'info']
        }
      ],
      
      'no-debugger': 'error',
      'no-alert': 'warn',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      
      // Best Practices
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'dot-notation': 'error',
      'no-else-return': 'error',
      'no-empty-function': 'warn',
      'no-magic-numbers': [
        'warn',
        {
          ignore: [-1, 0, 1, 2],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true
        }
      ],
      'no-multi-spaces': 'error',
      'no-return-assign': 'error',
      'no-return-await': 'error',
      'no-self-compare': 'error',
      'no-throw-literal': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unused-expressions': 'error',
      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'prefer-promise-reject-errors': 'error',
      'radix': 'error',
      'yoda': 'error',
      
      // Variables
      'no-label-var': 'error',
      'no-shadow': 'error',
      'no-undef-init': 'error',
      'no-undefined': 'error',
      'no-use-before-define': [
        'error',
        {
          functions: false,
          classes: true,
          variables: true
        }
      ],
      
      // Stylistic Issues
      'array-bracket-spacing': ['error', 'never'],
      'block-spacing': 'error',
      'brace-style': ['error', '1tbs'],
      'comma-dangle': ['error', 'never'],
      'comma-spacing': [
        'error',
        {
          before: false,
          after: true
        }
      ],
      'comma-style': ['error', 'last'],
      'computed-property-spacing': ['error', 'never'],
      'eol-last': 'error',
      'func-call-spacing': ['error', 'never'],
      'indent': [
        'error',
        2,
        {
          SwitchCase: 1
        }
      ],
      'key-spacing': [
        'error',
        {
          beforeColon: false,
          afterColon: true
        }
      ],
      'keyword-spacing': 'error',
      'linebreak-style': ['error', 'unix'],
      'max-len': [
        'warn',
        {
          code: 100,
          tabWidth: 2,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true
        }
      ],
      'no-multiple-empty-lines': [
        'error',
        {
          max: 2,
          maxEOF: 1
        }
      ],
      'no-trailing-spaces': 'error',
      'object-curly-spacing': ['error', 'always'],
      'quotes': [
        'error',
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: true
        }
      ],
      'semi': ['error', 'never'],
      'semi-spacing': 'error',
      'space-before-blocks': 'error',
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always'
        }
      ],
      'space-in-parens': ['error', 'never'],
      'space-infix-ops': 'error',
      'space-unary-ops': 'error',
      
      // ES6+ Rules
      'arrow-parens': ['error', 'as-needed'],
      'arrow-spacing': 'error',
      'constructor-super': 'error',
      'generator-star-spacing': ['error', 'after'],
      'no-class-assign': 'error',
      'no-confusing-arrow': 'error',
      'no-const-assign': 'error',
      'no-dupe-class-members': 'error',
      'no-duplicate-imports': 'error',
      'no-new-symbol': 'error',
      'no-this-before-super': 'error',
      'no-useless-computed-key': 'error',
      'no-useless-constructor': 'error',
      'no-useless-rename': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-const': 'error',
      'prefer-destructuring': [
        'error',
        {
          array: true,
          object: true
        },
        {
          enforceForRenamedProperties: false
        }
      ],
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'prefer-template': 'error',
      'rest-spread-spacing': ['error', 'never'],
      'symbol-description': 'error',
      'template-curly-spacing': 'error',
      'yield-star-spacing': ['error', 'after'],
      
      // React Specific Rules
      'react/boolean-prop-naming': 'error',
      'react/button-has-type': 'error',
      'react/default-props-match-prop-types': 'error',
      'react/destructuring-assignment': ['error', 'always'],
      'react/display-name': 'off',
      'react/forbid-prop-types': 'error',
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function'
        }
      ],
      'react/hook-use-state': 'error',
      'react/jsx-boolean-value': ['error', 'never'],
      'react/jsx-closing-bracket-location': 'error',
      'react/jsx-closing-tag-location': 'error',
      'react/jsx-curly-brace-presence': [
        'error',
        {
          props: 'never',
          children: 'never'
        }
      ],
      'react/jsx-curly-spacing': ['error', 'never'],
      'react/jsx-equals-spacing': ['error', 'never'],
      'react/jsx-filename-extension': [
        'error',
        {
          extensions: ['.jsx', '.tsx']
        }
      ],
      'react/jsx-first-prop-new-line': ['error', 'multiline'],
      'react/jsx-fragments': ['error', 'syntax'],
      'react/jsx-indent': ['error', 2],
      'react/jsx-indent-props': ['error', 2],
      'react/jsx-key': 'error',
      'react/jsx-max-props-per-line': [
        'error',
        {
          maximum: 3,
          when: 'multiline'
        }
      ],
      'react/jsx-newline': [
        'error',
        {
          prevent: true
        }
      ],
      'react/jsx-no-bind': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-literals': 'off',
      'react/jsx-no-target-blank': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-no-useless-fragment': 'error',
      'react/jsx-pascal-case': 'error',
      'react/jsx-props-no-multi-spaces': 'error',
      'react/jsx-sort-props': [
        'error',
        {
          callbacksLast: true,
          shorthandFirst: true,
          ignoreCase: true,
          reservedFirst: true
        }
      ],
      'react/jsx-tag-spacing': [
        'error',
        {
          closingSlash: 'never',
          beforeSelfClosing: 'always',
          afterOpening: 'never',
          beforeClosing: 'never'
        }
      ],
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/jsx-wrap-multilines': [
        'error',
        {
          declaration: 'parens-new-line',
          assignment: 'parens-new-line',
          return: 'parens-new-line',
          arrow: 'parens-new-line',
          condition: 'parens-new-line',
          logical: 'parens-new-line',
          prop: 'parens-new-line'
        }
      ],
      'react/no-array-index-key': 'warn',
      'react/no-children-prop': 'error',
      'react/no-danger': 'warn',
      'react/no-danger-with-children': 'error',
      'react/no-deprecated': 'error',
      'react/no-did-mount-set-state': 'error',
      'react/no-did-update-set-state': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-is-mounted': 'error',
      'react/no-multi-comp': 'error',
      'react/no-redundant-should-component-update': 'error',
      'react/no-render-return-value': 'error',
      'react/no-set-state': 'off',
      'react/no-typos': 'error',
      'react/no-string-refs': 'error',
      'react/no-this-in-sfc': 'error',
      'react/no-unescaped-entities': 'error',
      'react/no-unknown-property': 'error',
      'react/no-unsafe': 'error',
      'react/no-unused-prop-types': 'error',
      'react/no-unused-state': 'error',
      'react/no-will-update-set-state': 'error',
      'react/prefer-es6-class': ['error', 'always'],
      'react/prefer-stateless-function': 'error',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/require-default-props': 'off',
      'react/require-render-return': 'error',
      'react/self-closing-comp': 'error',
      'react/sort-comp': 'error',
      'react/sort-prop-types': 'error',
      'react/state-in-constructor': ['error', 'always'],
      'react/static-property-placement': ['error', 'property assignment'],
      'react/style-prop-object': 'error',
      'react/void-dom-elements-no-children': 'error'
    }
  },
  
  // TypeScript specific configuration
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // Disable rules that conflict with TypeScript
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-use-before-define': 'off'
    }
  },
  
  // Test files configuration
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.browser
      }
    },
    rules: {
      'no-magic-numbers': 'off',
      'max-len': 'off'
    }
  },
  
  // Configuration files
  {
    files: ['*.config.{js,ts}', '.eslintrc.{js,cjs}'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-console': 'off'
    }
  }
]

