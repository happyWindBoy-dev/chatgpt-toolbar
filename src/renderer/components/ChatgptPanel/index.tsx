import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@arco-design/web-react';
import icon from '../../../../assets/icon.png';
import './styles.scss';
import 'highlight.js/styles/atom-one-dark.css';
import { useThrottleFn } from 'ahooks';

import MarkdownIt from 'markdown-it';
import mdKatex from 'markdown-it-katex';
import mdHighlight from 'markdown-it-highlightjs';
import MessageItem from '../MessageItem';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { ClearOutlined, SettingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { UserConfig } from '../../../typings/global';

interface Props {
  userConfig: UserConfig;
}

interface MessageType {
  content: string;
  role: string;
}

const ChatgptPanel: React.FC<Props> = (props) => {
  const [inputValue, setInputValue] = useState('');
  const messageRef = useRef([] as MessageType[]);
  const [messages, setMessages] = useState([] as MessageType[]);
  const [loading, setLoading] = useState(false);
  const messageIdRef = useRef('');
  const streamMessageRef = useRef('');
  const controllerRef = useRef<AbortController>();

  const { run: runSmoothToBottom } = useThrottleFn(() => smoothToBottom(), {
    wait: 1000,
  });

  async function onMessage(message: string) {
    if (!message) {
      return;
    }
    const newMessages = [
      ...messages,
      {
        content: message,
        role: 'user',
      },
    ];
    messageRef.current = newMessages;
    setMessages(newMessages);
    setInputValue('');
    setLoading(true);
    generateText(message);
  }

  async function generateText(message: string) {
    streamMessageRef.current = '';
    controllerRef.current = new AbortController();

    const url = 'https://api.openai.com/v1/chat/completions';
    const data = JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [...messages, { role: 'user', content: message }],
      stream: true,
      temperature: 0.6,
    });

    await fetchEventSource(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${props.userConfig.apiKey}`,
      },
      body: data,
      signal: controllerRef.current.signal,
      onmessage(event: any) {
        const eventData = JSON.parse(event.data);
        if (
          eventData.choices?.[0].finish_reason === 'stop' ||
          event.data === '[DONE]' ||
          (messageIdRef.current && messageIdRef.current !== eventData.id)
        ) {
          messageIdRef.current = '';
          controllerRef.current.abort();
          setLoading(false);

          return;
        }
        if (!messageIdRef && eventData.id) {
          messageIdRef.current = eventData.id;
        }
        const char = eventData.choices?.[0].delta.content ?? '';
        streamMessageRef.current = streamMessageRef.current + char;
        setMessages([
          ...messageRef.current,
          {
            content: streamMessageRef.current,
            role: 'assistant',
          },
        ]);
      },
      onerror(error) {
        console.log('error', error)
        setLoading(false);
        setMessages([
          ...messageRef.current,
          {
            content:
              'Network error, please check your network settings and API key.',
            role: 'assistant',
          },
        ]);
        controllerRef.current.abort();
      },
    });
  }

  useEffect(runSmoothToBottom, [messages]);

  const htmlString = (message: string) => {
    const md = MarkdownIt({
      linkify: true,
      breaks: true,
    })
      .use(mdKatex)
      .use(mdHighlight, { inline: true })
      .use(require('markdown-it-attrs'));
    const fence = md.renderer.rules.fence!;
    md.renderer.rules.fence = (...args) => {
      const [tokens, idx] = args;
      const token = tokens[idx];
      const rawCode = fence(...args);

      return `<div relative>

      ${rawCode}
      </div>`;
    };

    if (typeof message === 'string') return md.render(message);

    return '';
  };

  const smoothToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const goPreference = () => {};

  return (
    <div className="gpt-wrapper">
      <div>
        <div className="px-30 pt-30">
          <div className="flex items-center justify-between mt-10">
            <div className="flex items-center">
              <img className="logo" alt="logo" src={icon} />
              <p className="ml-10 text-[22px] font-bold">ChatGPT</p>
            </div>

            <Link className="text-primary" to="/preference">
              <SettingOutlined
                onClick={goPreference}
                className="w-28 h-28 text-xl cursor-pointer"
              />
            </Link>
          </div>

          <p className="mt-10 text-secondary">
            Based on OpenAI API (gpt-3.5-turbo).
          </p>
        </div>
        <div className="messageList">
          {messages.map((item) => (
            <div className="messageContent">
              {item.role === 'user' ? (
                <MessageItem role="user">{item.content}</MessageItem>
              ) : (
                <MessageItem role="assistant">
                  <div
                    className="w-full"
                    dangerouslySetInnerHTML={{
                      __html: htmlString(item.content),
                    }}
                  />
                </MessageItem>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="gpt-footer">
        {loading ? (
          <p className="flex items-center justify-center text-center font-semibold text-primary text-lg">
            <span className="loadingTip">GPT is thinking...</span>
            <div
              onClick={() => {
                controllerRef.current.abort();
                setLoading(false);
              }}
              className="closeIcon"
            >
              Stop thinking...
            </div>
          </p>
        ) : (
          <>
            <ClearOutlined
              onClick={() => {
                setMessages([]);
              }}
              className=" bg-light-gray w-24 h-24 p-4 rounded-md absolute right-16 -top-42 text-lg cursor-pointer hover:opacity-70 "
            />
            <Input.TextArea
              placeholder="Message..."
              onPressEnter={(e) => {
                e.preventDefault();
                onMessage(e.target.value);
              }}
              onChange={(val) => {
                setInputValue(val);
              }}
              value={inputValue}
              autoSize={{ minRows: 1, maxRows: 4 }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatgptPanel;
