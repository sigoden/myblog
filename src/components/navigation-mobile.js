import React from "react"

import presets, { colors } from "../utils/presets"
import typography from "../utils/typography"

const MobileNavigation = () => (
  <div
    css={{
      position: `fixed`,
      display: `flex`,
      justifyContent: `space-around`,
      alignItems: `center`,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1,
      borderTop: `1px solid ${colors.ui.light}`,
      background: colors.ui.whisper,
      fontFamily: typography.options.headerFontFamily.join(`,`),
      [presets.Tablet]: {
        display: `none`,
      },
    }}
  >
  </div>
)

export default MobileNavigation
