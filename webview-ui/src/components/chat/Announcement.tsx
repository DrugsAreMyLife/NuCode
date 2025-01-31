import * as React from "react"
import { memo } from "react"
import {
  Container,
  CloseButton,
  Title,
  Paragraph,
  SubTitle,
  List,
  Icon,
  StyledLink
} from "./AnnouncementStyles"

interface AnnouncementProps {
  version: string
  hideAnnouncement: () => void
}

/*
You must update the latestAnnouncementId in ClineProvider for new announcements to show to users. 
This new id will be compared with what's in state for the 'last announcement shown', and if it's 
different then the announcement will render. As soon as an announcement is shown, the id will be 
updated in state. This ensures that announcements are not shown more than once, even if the user 
doesn't close it themselves.
*/
const Announcement = memo<AnnouncementProps>(({ version, hideAnnouncement }) => {
  return (
    <Container>
      <CloseButton appearance="icon" onClick={hideAnnouncement}>
        <span className="codicon codicon-close" />
      </CloseButton>

      <Title>
        <span className="emoji">🎉</span>
        Introducing Roo Code 3.2
      </Title>

      <Paragraph>
        Our biggest update yet is here - we're officially changing our name from Roo Cline to Roo Code! 
        After growing beyond 50,000 installations, we're ready to chart our own course. Our heartfelt 
        thanks to everyone in the Cline community who helped us reach this milestone.
      </Paragraph>

      <SubTitle>Custom Modes: Celebrating Our New Identity</SubTitle>
      <Paragraph>
        To mark this new chapter, we're introducing the power to shape Roo Code into any role you need! 
        Create specialized personas and create an entire team of agents with deeply customized prompts:
        <List>
          <li>QA Engineers who write thorough test cases and catch edge cases</li>
          <li>Product Managers who excel at user stories and feature prioritization</li>
          <li>UI/UX Designers who craft beautiful, accessible interfaces</li>
          <li>Code Reviewers who ensure quality and maintainability</li>
        </List>
        Just click the <Icon className="codicon codicon-notebook" /> icon to get started with Custom Modes!
      </Paragraph>

      <SubTitle>Join Us for the Next Chapter</SubTitle>
      <Paragraph>
        We can't wait to see how you'll push Roo Code's potential even further! Share your custom modes 
        and join the discussion at{" "}
        <StyledLink href="https://www.reddit.com/r/RooCode">
          reddit.com/r/RooCode
        </StyledLink>
        .
      </Paragraph>
    </Container>
  )
})

Announcement.displayName = 'Announcement'

export default Announcement
