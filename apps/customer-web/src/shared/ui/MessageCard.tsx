import { InformationCircle as InfoCircleIcon } from '@assets/icons';

interface MessageCardProps {
  message: React.ReactNode;
}

const MessageCard = ({ message }: MessageCardProps) => {
  return (
    <div className="padding bg-background-normal-alternative flex max-w-[350px] items-center gap-[8px] rounded-lg px-[20px] py-[12px]">
      <InfoCircleIcon fill={'#13C2C2'} />
      {message}
    </div>
  );
};

export default MessageCard;
