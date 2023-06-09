import React, { useEffect, useState } from 'react';
import { Input, Switch } from '@arco-design/web-react';
import { UserConfig } from '../../../typings/global';
import { LeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

interface Props {
  userConfig: UserConfig;
}

const index: React.FC<Props> = (props) => {
  const [config, setConfig] = useState<UserConfig>({} as UserConfig);

  useEffect(() => {
    if (props.userConfig) {
      setConfig(props.userConfig);
    }
  }, [props.userConfig]);

  return (
    <div className="p-30 flex h-screen flex-col justify-between overflow-hidden">
      <div>
        <Link className="text-primary" to="/">
          <LeftOutlined className=" mb-30 cursor-pointer" />
        </Link>

        <div className="flex items-center">
          <div className="font-bold text-xl">Preference</div>
        </div>
        <div className="mt-40">
          <p className="text-lg font-semibold">Api key</p>
          <Input
            value={config.apiKey}
            onChange={(value) => {
              setConfig({ ...config, apiKey: value.trim() });
            }}
            placeholder="https://platform.openai.com/account/api-keys"
          ></Input>
        </div>
        <div className="mt-40 flex items-center">
          <p className="text-lg font-semibold mr-30">Shortcut</p>
          <p className=" border-secondary bottom-1 border-dashed rounded-md p-8">CommandOrControl+Shift+g</p>
        </div>
        <div className="mt-40 flex items-center">
          <p className="text-lg font-semibold mr-30">Always on Top</p>
          <Switch
            checked={config.alwaysOnTop}
            onChange={(value) =>
              setConfig({
                ...config,
                alwaysOnTop: value,
              })
            }
          />
        </div>
      </div>
      <div className="flex justify-center">
        <div
          onClick={() => {
            window.electronAPI.setUserConfig(config);
          }}
          className="w-[70%] hover:opacity-75 flex justify-center items-center fixed bottom-20 h-60 bg-gray rounded-lg text-primary cursor-pointer"
        >
          Save
        </div>
      </div>
    </div>
  );
};

export default index;
