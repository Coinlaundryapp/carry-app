import React from 'react';

type Props = {
  title: string;
  subTitle: string;
  containerClassName?: string;
  questionClassName?: string;
  answerClassName?: string;
};

const QuestionAnswer: React.FC<Props> = ({
  title,
  subTitle,
  containerClassName,
  questionClassName,
  answerClassName,
}) => {
  return (
    <div className={containerClassName}>
      <p className={`${questionClassName}`}>{title}</p>
      <p className={` ${answerClassName}`}>{subTitle}</p>
    </div>
  );
};

export default QuestionAnswer;
