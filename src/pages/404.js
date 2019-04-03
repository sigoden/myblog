import React from "react"
import { graphql } from "gatsby"
import Container from "../components/container"
import DefaultLayout from "../components/default-layout"

class FourOhFour extends React.Component {
  render() {
    return (
      <DefaultLayout location={this.props.location} githubUrl={this.props.data.site.siteMetadata.githubUrl}>
        <Container>
          <h1>Page not found</h1>
        </Container>
      </DefaultLayout>
    )
  }
}

export const pageQuery = graphql`
  query P404Query {
    site {
      siteMetadata {
        githubUrl
      }
    }
  }
`


export default FourOhFour
