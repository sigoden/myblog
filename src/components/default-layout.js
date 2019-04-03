import React from "react"
import Navigation from "./navigation"
import MobileNavigation from "./navigation-mobile"
import presets  from "../utils/presets"
import "../css/prism-coy.css"

// Other fonts
import "typeface-spectral"
import "typeface-space-mono"

// location, githubUrl, 
class DefaultLayout extends React.Component {
  render() {
    const { location, githubUrl, children } = this.props;
    const isHomepage = location.pathname === `/`

    return (
      <div className={isHomepage ? `is-homepage` : ``}>
        <Navigation pathname={location.pathname} githubUrl={githubUrl}/>
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
              display: `block`,
              paddingLeft: 0,
            }}
          >
            {children}
          </div>
        </div>
        <MobileNavigation />
      </div>
    )
  }
}

export default DefaultLayout
