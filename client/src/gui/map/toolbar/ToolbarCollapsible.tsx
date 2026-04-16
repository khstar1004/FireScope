import React, { useState } from "react";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import {
  Button,
  Checkbox,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  SvgIconProps,
  Tooltip,
  Typography,
} from "@mui/material";
import { Menu } from "@/gui/shared/ui/MuiComponents";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import Stack from "@mui/material/Stack";
import ClearIcon from "@mui/icons-material/Clear";
import DeselectCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBoxOutlined";
import SelectCheckBoxIcon from "@mui/icons-material/CheckBox";
import { colorPalette } from "@/utils/constants";

interface ToolbarCollapsibleProps {
  title: string;
  content: React.JSX.Element;
  width?: number;
  height?: number;
  prependIcon?: React.ComponentType<SvgIconProps>;
  appendIcon?: React.ComponentType<SvgIconProps>;
  appendIconProps?: {
    tooltipProps?: {
      title: string;
      placement?:
        | "bottom-end"
        | "bottom-start"
        | "bottom"
        | "left-end"
        | "left-start"
        | "left"
        | "right-end"
        | "right-start"
        | "right"
        | "top-end"
        | "top-start"
        | "top";
      arrow?: boolean;
    };
    onClick: () => void;
  };
  enableFilter?: boolean;
  filterProps?: {
    options: { label: string; value: string }[];
    onApplyFilterOptions: (selectedOptions: string[]) => void;
  };
  open: boolean;
}

export default function ToolbarCollapsible(
  props: Readonly<ToolbarCollapsibleProps>
) {
  const PrependIcon = props.prependIcon;
  const AppendIcon = props.appendIcon;
  const filterOptions: { label: string; value: string }[] =
    props.filterProps?.options || [];
  const appendIconProps = props.appendIconProps;

  const [open, setOpen] = useState(props.open);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilterItems, setSelectedFilterItems] = useState<string[]>([
    ...filterOptions.map((option) => option.value),
  ]);
  const [tempSelectedFilterItems, setTempSelectedFilterItems] = useState<
    string[]
  >([]);

  const handleOpenFilterMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setTempSelectedFilterItems([...selectedFilterItems]);
  };

  const handleCloseFilterMenu = () => {
    setAnchorEl(null);
    setTempSelectedFilterItems([...selectedFilterItems]);
  };

  const handleToggle = (value: string) => {
    setTempSelectedFilterItems((prevItems: string[]) =>
      prevItems.includes(value)
        ? prevItems.filter((item) => item !== value)
        : [...prevItems, value]
    );
  };

  const handleApply = () => {
    setSelectedFilterItems([...tempSelectedFilterItems]);
    props.filterProps?.onApplyFilterOptions([...tempSelectedFilterItems]);
    handleCloseFilterMenu();
  };

  const handleUnselectAll = () => {
    setTempSelectedFilterItems([]);
  };

  const handleSelectAll = () => {
    setTempSelectedFilterItems([
      ...filterOptions.map((option) => option.value),
    ]);
  };

  return (
    <>
      <ListItem
        sx={{
          px: 1.2,
          py: 0.8,
          background: open
            ? "linear-gradient(180deg, rgba(14, 39, 47, 0.98) 0%, rgba(9, 24, 30, 0.96) 100%)"
            : "linear-gradient(180deg, rgba(10, 28, 35, 0.96) 0%, rgba(7, 20, 25, 0.94) 100%)",
          borderRadius: 2,
          border: open
            ? "1px solid rgba(45, 214, 196, 0.26)"
            : `1px solid ${colorPalette.darkGray}`,
          boxShadow: open
            ? "0 18px 34px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(134, 255, 242, 0.06)"
            : "0 14px 26px rgba(0, 0, 0, 0.18)",
          transition:
            "background 160ms ease, border-color 160ms ease, box-shadow 160ms ease",
        }}
      >
        {/** Prepend Icon */}
        {PrependIcon && (
          <IconButton
            disableRipple
            sx={{ minWidth: "unset", p: 0, m: 0, mr: 1, cursor: "default" }}
          >
            <PrependIcon />
          </IconButton>
        )}
        <ListItemText
          primary={props.title}
          primaryTypographyProps={{
            fontWeight: 700,
            letterSpacing: "0.05em",
            fontSize: 13,
          }}
        />
        {/** Append Icon */}
        {AppendIcon && (
          <Tooltip
            title={appendIconProps?.tooltipProps?.title}
            disableHoverListener={appendIconProps?.tooltipProps ? false : true}
            placement={appendIconProps?.tooltipProps?.placement || "bottom"}
            arrow={appendIconProps?.tooltipProps?.arrow || false}
          >
            <IconButton
              onClick={appendIconProps?.onClick}
              sx={{ minWidth: "unset", mr: 2, p: 0.5, m: 0 }}
            >
              <AppendIcon />
            </IconButton>
          </Tooltip>
        )}
        {/** Filter Menu/Button  */}
        {props.enableFilter && filterOptions.length && (
          <>
            <Tooltip title="필터">
              <IconButton
                id="filter-button"
                aria-controls={anchorEl ? "filter-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={anchorEl ? "true" : undefined}
                onClick={handleOpenFilterMenu}
                sx={{ minWidth: "unset", mr: 2, p: 0.5, m: 0 }}
              >
                <FilterAltIcon />
              </IconButton>
            </Tooltip>
            <Menu
              id="filter-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseFilterMenu}
              slotProps={{
                root: { sx: { ".MuiList-root": { padding: 0 } } },
                list: {
                  "aria-labelledby": "filter-button",
                },
              }}
            >
              <Stack
                direction={"row"}
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: colorPalette.lightGray,
                  pl: 0.2,
                  pt: 1,
                  pb: 1,
                }}
              >
                {/** Header: Select/Unselect All & Close Button */}
                {!tempSelectedFilterItems.length ? (
                  <Button
                    size="medium"
                    variant="text"
                    sx={{ alignItems: "end" }}
                    onClick={handleSelectAll}
                  >
                    <SelectCheckBoxIcon />
                    <Typography sx={{ ml: 1 }} variant="caption">
                      전체 선택
                    </Typography>
                  </Button>
                ) : (
                  <Button
                    sx={{ alignItems: "end" }}
                    size="medium"
                    variant="text"
                    onClick={handleUnselectAll}
                  >
                    <DeselectCheckBoxIcon />
                    <Typography sx={{ ml: 1 }} variant="caption">
                      전체 해제
                    </Typography>
                  </Button>
                )}
                <IconButton onClick={handleCloseFilterMenu} sx={{ mr: 0.5 }}>
                  <ClearIcon sx={{ fontSize: 15, color: "red" }} />
                </IconButton>
              </Stack>
              {/** Menu Items */}
              {filterOptions.map((option: { label: string; value: string }) => (
                <MenuItem
                  sx={{ pl: 0 }}
                  key={option.value}
                  onClick={() => handleToggle(option.value)}
                >
                  <ListItemIcon>
                    <Checkbox
                      checked={tempSelectedFilterItems.includes(option.value)}
                    />
                  </ListItemIcon>
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
              {/* Apply Button */}
              <Button
                sx={{ borderRadius: 0 }}
                variant="contained"
                fullWidth
                onClick={handleApply}
              >
                적용
              </Button>
            </Menu>
          </>
        )}
        {/** Toggle Show/Hide Dropdown */}
        <IconButton
          sx={{
            p: 0.5,
            m: 0,
            minWidth: "unset",
            "&:hover": {
              cursor: "pointer",
            },
          }}
          onClick={() => {
            setOpen(!open);
          }}
        >
          {open ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </ListItem>
      {/** Collapse Content */}
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ px: 0.35, pt: 0.9 }}>
          <Box
            sx={{
              p: 1.1,
              borderRadius: 2,
              background:
                "linear-gradient(180deg, rgba(8, 22, 28, 0.94) 0%, rgba(5, 15, 19, 0.96) 100%)",
              border: "1px solid rgba(45, 214, 196, 0.12)",
              boxShadow: "0 16px 32px rgba(0, 0, 0, 0.16)",
            }}
          >
            {props.content}
          </Box>
        </Box>
      </Collapse>
    </>
  );
}
