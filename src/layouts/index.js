import React from "react"

import Navigation from "../components/navigation"
import MobileNavigation from "../components/navigation-mobile"
import { rhythm } from "../utils/typography"
import presets, { colors } from "../utils/presets"
import hex2rgba from "hex2rgba"
import "../css/prism-coy.css"

// Other fonts
import "typeface-spectral"
import "typeface-space-mono"

class DefaultLayout extends React.Component {
  render() {
    const isHomepage = this.props.location.pathname == `/`

    const leftPadding = rhythmSize => {
      return 0
    }

    const sidebarStyles = {
      borderRight: `1px solid ${colors.ui.light}`,
      backgroundColor: colors.ui.whisper,
      width: rhythm(10),
      display: `none`,
      position: `fixed`,
      top: `calc(${presets.headerHeight} - 1px)`,
      overflowY: `auto`,
      height: `calc(100vh - ${presets.headerHeight} + 1px)`,
      WebkitOverflowScrolling: `touch`,
      "::-webkit-scrollbar": {
        width: `6px`,
        height: `6px`,
      },
      "::-webkit-scrollbar-thumb": {
        background: colors.ui.bright,
      },
      "::-webkit-scrollbar-track": {
        background: colors.ui.light,
      },
    }

    let childrenMobileDisplay = { display: `block`}
    let childrenTabletDisplay = { display: `block` }

    return (
      <div className={isHomepage ? `is-homepage` : ``}>
        <Navigation pathname={this.props.location.pathname} />
        <div
          className={`main-body`}
          css={{
            paddingTop: 0,
            [presets.Tablet]: {
              margin: `0 auto`,
              paddingTop: isHomepage ? 0 : presets.headerHeight,
            },
          }}
        >
          <div
            css={{
              ...childrenMobileDisplay,
              [presets.Tablet]: {
                paddingLeft: leftPadding(10),
                ...childrenTabletDisplay,
              },
              [presets.Desktop]: {
                paddingLeft: leftPadding(12),
              },
            }}
          >
            {this.props.children()}
          </div>
        </div>
        <MobileNavigation />
      </div>
    )
  }
}

module.exports = DefaultLayout
