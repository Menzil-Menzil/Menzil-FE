import {AsideBtnGroup, AsideListDiv} from "@/component/main/userAside/userAside.style";
import ChattingCard from "@/component/main/userAside/asideMenu/chattingCard";
import {useSession} from "next-auth/react";
import {authedTokenAxios, refreshTokenAPI} from "@/lib/jwt";
import {useEffect, useState} from "react";
import {userState} from "@/states/stateUser";
import {useRecoilValue} from "recoil"
import styled from "@emotion/styled";
import FollowingCard from "@/component/main/userAside/asideMenu/followingCard";
import RightIc from "@/img/ic_right_arrow_20.svg"

export const AsideMenuContainer = styled.div`
  height: 323px;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  background: var(--aside-menu-bg-color);
`;

interface RadioElementType {
  children: any,
  value: string,
  defaultChecked: boolean,
  onChange: any
}
const Radio = ({ children, value, defaultChecked, onChange }: RadioElementType) => {
  return (
    <>
      <input
        id={value}
        type="radio"
        name="menu"
        value={value}
        defaultChecked={defaultChecked}
        onChange={onChange}
      />
      <label htmlFor={value}>
        {children}
      </label>
    </>
  );
}

const AsideMenu = () => {
  const user = useRecoilValue(userState);
  const {data: sessionData, update: sessionUpdate} =useSession();
  const [chatLogDataList, setChatLogDataList] = useState<any[]>();
  const [followingList, setFollowingList] = useState<any[]>();
  const [menuComponent, setMenuComponent] = useState("mentors");
  const handleMenuChange = (e: any) => {
    setMenuComponent(e.target.value)
  };
  const chatLogAxios = async (sessionData: any) => {
    try {
      const result = await authedTokenAxios(sessionData.accessToken)
        .get(`${process.env.NEXT_PUBLIC_API_URL}/api/main/userinfo?nickname=${user.name}`)
      setChatLogDataList(result.data.data)
    } catch (error: any) {
      console.log(`${error.response?.data?.code}: ${error.response?.data?.message}`)
      refreshTokenAPI(sessionData, sessionUpdate).then()
    }
  };
  const followingAxios = async (sessionData: any) => {
    try {
      const result = await authedTokenAxios(sessionData.accessToken)
        .get(`${process.env.NEXT_PUBLIC_API_URL}/api/main/following`)
      setFollowingList(result.data.data)
    } catch (error: any) {
      console.log(`${error.response?.data?.code}: ${error.response?.data?.message}`)
      refreshTokenAPI(sessionData, sessionUpdate).then()
    }
  };

  useEffect(() => {
    if (!!user.name && sessionData?.user) {
      chatLogAxios(sessionData).then();
      //followingAxios(sessionData).then();
    }
  }, [sessionData, user.name]);

  return (
    <AsideMenuContainer>
      <AsideBtnGroup>
        <div className="radioBtnGroup">
          <Radio value="mentors" defaultChecked onChange={handleMenuChange}>관심멘토</Radio>
          <Radio value="chat" defaultChecked={false} onChange={handleMenuChange}>채팅목록</Radio>
        </div>
        <button className="btnStyle">
          {menuComponent === "mentors" ?
            "모든 멘토" :
            "모든 채팅"
          }
          <RightIc/>
        </button>
      </AsideBtnGroup>
      {menuComponent === "mentors" && (
        <AsideListDiv>
          {followingList && followingList.map((data: any, index: number) => {
            if (index < 4) {
              return <FollowingCard key={index} data={data}/>
            }
          })}
          <FollowingCard data={undefined}/>
          <FollowingCard data={undefined}/>
          <FollowingCard data={undefined}/>
          <FollowingCard data={undefined}/>
        </AsideListDiv>
      )}
      {menuComponent === "chat" && (
        <AsideListDiv>
          {chatLogDataList && chatLogDataList.map((data: any, index: number) => {
            if(index < 3) {
              return <ChattingCard key={index} data={data}/>
            }
          })}
        </AsideListDiv>
      )}
    </AsideMenuContainer>
  );
};
export default AsideMenu;