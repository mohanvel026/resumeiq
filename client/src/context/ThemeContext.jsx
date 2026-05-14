// Stub ThemeContext - dark mode removed but kept for import compatibility
import { createContext, useContext } from 'react'

const ThemeContext = createContext({ dark: false, toggle: () => {} })

export const ThemeProvider = ({ children }) => children

export const useTheme = () => ({ dark: false, toggle: () => {} })

export default ThemeContext