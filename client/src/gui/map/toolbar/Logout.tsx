import { useAuth0 } from "@auth0/auth0-react";
import { Chip, Tooltip } from "@mui/material";
import React from "react";

const LogoutButton = () => {
  const { user, logout } = useAuth0();

  return (
    <Tooltip title={"현재 계정: " + (user ? user.name : "알 수 없음")}>
      <Chip
        variant="outlined"
        onClick={() =>
          logout({ logoutParams: { returnTo: window.location.origin } })
        }
        label="로그아웃"
        sx={{
          marginRight: "1em",
          fontWeight: 700,
        }}
      />
    </Tooltip>
  );
};

export default LogoutButton;
