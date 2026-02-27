import InfoCircleIcon from '../../../public/assets/icons/information-circle.svg';

interface MessageCardProps {
  message: React.ReactNode;
}

const MessageCard = ({ message }: MessageCardProps) => {
  return (
    <div className="padding flex max-w-[350px] items-center gap-[8px] rounded-lg bg-background-normal-alternative px-[20px] py-[12px]">
      <InfoCircleIcon fill={'#13C2C2'} />
      {message}
    </div>
  );
};

export default MessageCard;
