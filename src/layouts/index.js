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

    return (
      <div className={isHomepage ? `is-homepage` : ``}>
        <Navigation pathname={this.props.location.pathname} githubUrl={this.props.data.site.siteMetadata.githubUrl}/>
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
            {this.props.children()}
          </div>
        </div>
        <MobileNavigation />
      </div>
    )
  }
}

export const query = graphql`
  query Layout {
    site {
      siteMetadata {
        githubUrl
      }
    }
  }
`
module.exports = DefaultLayout
