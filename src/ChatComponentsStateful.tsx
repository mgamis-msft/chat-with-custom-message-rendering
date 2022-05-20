import {
  usePropsFor,
  MessageThread,
  SendBox,
  MessageProps,
  ChatMessage,
  SystemMessage,
} from "@azure/communication-react";
import React from "react";
import { ChatMessage as ChatMessageComponent } from "@fluentui/react-northstar";
import { Stack } from "@fluentui/react";

function ChatComponents(): JSX.Element {
  const messageThreadProps = usePropsFor(MessageThread);
  const sendBoxProps = usePropsFor(SendBox);

  const customeOnRenderMessage = (messageProps: MessageProps): JSX.Element => {
    if (messageProps.message.messageType === "chat") {
      const chatMessage = messageProps.message as ChatMessage;
      return (
        <Stack
          verticalFill
          styles={{ root: { marginBottom: "10px" } }}
          horizontalAlign="end"
        >
          <ChatMessageComponent mine={messageProps.message.mine}>
            {chatMessage.content}
          </ChatMessageComponent>
          <div>{formatTimestampForChatMessage(chatMessage.createdOn)}</div>
        </Stack>
      );
    } else if (messageProps.message.messageType === "system") {
      const systemMessage = messageProps.message as SystemMessage;
      switch (systemMessage.systemMessageType) {
        case "participantAdded":
          return (
            <Stack>{`${systemMessage.participants
              .map((p) => p.displayName)
              .join(",")} joined the chat`}</Stack>
          );
      }
    }
    return <></>;
  }

  return (
    <div>
      <div style={{ height: "50rem", width: "50rem" }}>
        {/*Props are updated asynchronously, so only render the component once props are populated.*/}
        {messageThreadProps && (
          <MessageThread
            {...messageThreadProps}
            onRenderMessage={customeOnRenderMessage}
          />
        )}
      </div>
      {sendBoxProps && <SendBox {...sendBoxProps} />}
    </div>
  );
}

const formatTimestampForChatMessage = (messageDate: Date): string => {
  const todayDate = new Date();
  // If message was in the same day timestamp string is just the time like '1:30 p.m.'.
  const startOfDay = new Date(
    todayDate.getFullYear(),
    todayDate.getMonth(),
    todayDate.getDate()
  );
  if (messageDate > startOfDay) {
    return formatTimeForChatMessage(messageDate);
  }

  // If message was yesterday then timestamp string is like this 'Yesterday 1:30 p.m.'.
  const yesterdayDate = new Date(
    todayDate.getFullYear(),
    todayDate.getMonth(),
    todayDate.getDate() - 1
  );
  if (messageDate > yesterdayDate) {
    return "Yesterday " + formatTimeForChatMessage(messageDate);
  }

  // If message was before Sunday and today is Sunday (start of week) then timestamp string is like
  // '2021-01-10 1:30 p.m.'.
  const weekDay = todayDate.getDay();
  if (weekDay === 0) {
    return (
      formatDateForChatMessage(messageDate) +
      " " +
      formatTimeForChatMessage(messageDate)
    );
  }

  // If message was before first day of the week then timestamp string is like Monday 1:30 p.m.
  const firstDayOfTheWeekDate = new Date(
    todayDate.getFullYear(),
    todayDate.getMonth(),
    todayDate.getDate() - weekDay
  );
  if (messageDate > firstDayOfTheWeekDate) {
    return (
      weekday[messageDate.getDay()] +
      " " +
      formatTimeForChatMessage(messageDate)
    );
  }

  // If message date is in previous or older weeks then timestamp string is like 2021-01-10 1:30 p.m.
  return (
    formatDateForChatMessage(messageDate) +
    " " +
    formatTimeForChatMessage(messageDate)
  );
};

const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const formatTimeForChatMessage = (messageDate: Date): string => {
  let hours = messageDate.getHours();
  let minutes = messageDate.getMinutes().toString();
  const isAm = hours < 12;
  if (hours > 12) {
    hours = hours - 12;
  }
  if (hours === 0) {
    hours = 12;
  }
  if (minutes.length < 2) {
    minutes = "0" + minutes;
  }
  return hours.toString() + ":" + minutes + " " + (isAm ? "a.m." : "p.m.");
};

const formatDateForChatMessage = (messageDate: Date): string => {
  const year = messageDate.getFullYear().toString();
  let month = (messageDate.getMonth() + 1).toString();
  let day = messageDate.getDate().toString();

  if (month.length === 1) {
    month = '0' + month;
  }
  if (day.length === 1) {
    day = '0' + day;
  }

  return year + '-' + month + '-' + day;
};

export default ChatComponents;
