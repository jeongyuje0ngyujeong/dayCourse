import React from 'react';
import styled, { keyframes } from 'styled-components';
import PropTypes from 'prop-types';

const UploadButton = ({ onClick, isUploading }) => {
  return (
    <StyledButton onClick={onClick} disabled={isUploading}>
      {isUploading ? <LoadingAnimation /> : <ButtonText>Upload</ButtonText>}
    </StyledButton>
  );
};

UploadButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  isUploading: PropTypes.bool.isRequired,
};

const ButtonText = styled.span`
  color: #143240;
  font-size: 14px;
  font-weight: bold;
`;

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const LoadingAnimation = styled.div`
  width: 20px;
  height: 20px;
  border: 3px solid #143240;
  border-top: 3px solid #fff;
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
`;

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 42px;
  background-color: #fff;
  border: 2px solid #143240;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #f0f0f0;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export default UploadButton;