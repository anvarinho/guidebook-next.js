import nextVitals from 'eslint-config-next/core-web-vitals'
import { globalIgnores } from 'eslint/config'

const config = [
  ...nextVitals,
  globalIgnores(['.next/**', '.next-build/**', 'out/**', 'build/**', 'next-env.d.ts']),
  {
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      '@next/next/no-assign-module-variable': 'off',
    },
  },
]

export default config
