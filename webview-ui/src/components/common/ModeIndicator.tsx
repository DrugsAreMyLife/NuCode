import * as React from 'react';
import styled, { keyframes } from 'styled-components';
import { Mode } from '../../../../src/shared/modes';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(var(--roo-primary-rgb), 0.4);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(var(--roo-primary-rgb), 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(var(--roo-primary-rgb), 0);
  }
`;

const Container = styled.div<{ $mode: Mode; $isTransitioning: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 500px;
  font-size: 11px;
  font-weight: 500;
  cursor: help;
  background-color: ${props => {
    switch (props.$mode) {
      case 'code':
        return 'var(--roo-primary)';
      case 'architect':
        return 'color-mix(in srgb, var(--roo-primary) 80%, var(--background))';
      case 'frontend':
        return 'color-mix(in srgb, var(--roo-primary) 60%, var(--background))';
      case 'backend':
        return 'color-mix(in srgb, var(--roo-primary) 40%, var(--background))';
      case 'security':
        return 'color-mix(in srgb, var(--destructive) 60%, var(--background))';
      case 'devops':
        return 'color-mix(in srgb, var(--roo-primary) 20%, var(--background))';
      default:
        return 'var(--muted)';
    }
  }};
  color: var(--primary-foreground);
  animation: ${fadeIn} 0.3s ease;
  transition: background-color 0.3s ease;

  ${props => props.$isTransitioning && `
    animation: ${pulse} 0.5s ease;
  `}

  &:hover {
    filter: brightness(1.1);
  }

  .codicon {
    font-size: 12px;
    margin-bottom: -1px;
  }
`;

const Tooltip = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--background);
  border: 1px solid var(--chat-bubble-border);
  border-radius: var(--radius);
  padding: 8px 12px;
  font-size: 11px;
  white-space: nowrap;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  animation: ${fadeIn} 0.2s ease;
`;

const Capabilities = styled.div`
  margin-top: 4px;
  color: var(--foreground-light);
  font-size: 10px;
`;

interface ModeIndicatorProps {
  mode: Mode;
  isTransitioning?: boolean;
}

export const getModeIcon = (mode: Mode): string => {
  switch (mode) {
    case 'code':
      return 'code';
    case 'architect':
      return 'project';
    case 'frontend':
      return 'layout';
    case 'backend':
      return 'server';
    case 'security':
      return 'shield';
    case 'devops':
      return 'server-environment';
    default:
      return 'symbol-misc';
  }
};

const getModeDescription = (mode: Mode): string => {
  switch (mode) {
    case 'code':
      return 'General software development with broad language support';
    case 'architect':
      return 'Focus on system design, patterns, and high-level decisions';
    case 'frontend':
      return 'Specialized for web UI/UX development';
    case 'backend':
      return 'Optimized for server-side and API development';
    case 'security':
      return 'Specialized for security audits and fixes';
    case 'devops':
      return 'Infrastructure and deployment focused';
    default:
      return 'General technical assistance';
  }
};

const getModeCapabilities = (mode: Mode): string[] => {
  switch (mode) {
    case 'code':
      return ['Multi-language support', 'Code generation', 'Debugging assistance'];
    case 'architect':
      return ['System design', 'Pattern implementation', 'Architecture documentation'];
    case 'frontend':
      return ['UI/UX design', 'Component development', 'Responsive layouts'];
    case 'backend':
      return ['API development', 'Database optimization', 'Server configuration'];
    case 'security':
      return ['Security audits', 'Vulnerability fixes', 'Best practices'];
    case 'devops':
      return ['CI/CD pipelines', 'Infrastructure management', 'Deployment'];
    default:
      return ['General assistance', 'Technical guidance', 'Best practices'];
  }
};

const ModeIndicator: React.FC<ModeIndicatorProps> = ({ mode, isTransitioning = false }) => {
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <Container
      $mode={mode}
      $isTransitioning={isTransitioning}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className={`codicon codicon-${getModeIcon(mode)}`} />
      {mode}
      {showTooltip && (
        <Tooltip>
          {getModeDescription(mode)}
          <Capabilities>
            {getModeCapabilities(mode).map((capability, index) => (
              <div key={index}>• {capability}</div>
            ))}
          </Capabilities>
        </Tooltip>
      )}
    </Container>
  );
};

export default React.memo(ModeIndicator);