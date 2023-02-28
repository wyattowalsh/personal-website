import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { Button } from '@mui/material'
import { useTheme } from 'next-themes'
import { FC, useEffect, useState } from 'react'
import styles from './ThemeUpdater.module.scss'

const ThemeUpdater: FC<{}> = () => {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), [])

  if (!mounted) return <div></div>

  return (
    <Button
      size="large"
      variant="text"
      endIcon={
        resolvedTheme === 'light' ? (
          <DarkModeIcon className={styles.updater} />
        ) : (
          <LightModeIcon className={styles.updater} />
        )
      }
      onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
      className={styles.updater}
    />
  )
}

export default ThemeUpdater
