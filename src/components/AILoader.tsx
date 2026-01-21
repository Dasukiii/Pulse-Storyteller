import styled from 'styled-components';

interface AILoaderProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function AILoader({ size = 'md' }: AILoaderProps) {
  const sizeMap = {
    sm: '1.5em',
    md: '3em',
    lg: '4em',
  };

  const innerSizeMap = {
    sm: '0.75em',
    md: '1.5em',
    lg: '2em',
  };

  return (
    <StyledWrapper $size={sizeMap[size]} $innerSize={innerSizeMap[size]}>
      <div className="spinner">
        <div className="spinnerin" />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div<{ $size: string; $innerSize: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  .spinner {
    width: ${props => props.$size};
    height: ${props => props.$size};
    cursor: not-allowed;
    border-radius: 50%;
    border: 2px solid #444;
    box-shadow: -10px -10px 10px #6359f8, 0px -10px 10px 0px #9c32e2, 10px -10px 10px #f36896, 10px 0 10px #ff0b0b, 10px 10px 10px 0px#ff5500, 0 10px 10px 0px #ff9500, -10px 10px 10px 0px #ffb700;
    animation: rot55 0.7s linear infinite;
    position: relative;
  }

  .spinnerin {
    border: 2px solid #444;
    width: ${props => props.$innerSize};
    height: ${props => props.$innerSize};
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  @keyframes rot55 {
    to {
      transform: rotate(360deg);
    }
  }
`;
