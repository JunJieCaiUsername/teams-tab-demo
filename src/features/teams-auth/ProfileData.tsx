import React, { useState } from "react";
import {
  DataGrid,
  DataGridHeader,
  DataGridRow,
  DataGridHeaderCell,
  DataGridBody,
  DataGridCell,
  createTableColumn,
  TabList,
  Tab,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import type {
  TableColumnDefinition,
  TabValue,
} from "@fluentui/react-components";
import type { UserInfo } from "../../types/UserInfo";
import { decodeToken } from "../../services/tools";

const useStyles = makeStyles({
  container: {
    width: "100%",
  },
  tabList: {
    marginBottom: tokens.spacingVerticalL,
  },
  dataGrid: {
    width: "100%",
  },
});

interface UserInfoItem {
  property: string;
  value: string;
}

interface TokenClaimItem {
  claim: string;
  value: string;
}

interface ProfileDataProps {
  graphData: UserInfo;
  accessToken: string;
}

const ProfileData: React.FC<ProfileDataProps> = ({
  graphData,
  accessToken,
}) => {
  const styles = useStyles();
  const [selectedTab, setSelectedTab] = useState<TabValue>("basic");

  //Prepare data for Datagrids
  const tokenClaims = decodeToken(accessToken);

  const basicUserInfo: UserInfoItem[] = [
    { property: "Name", value: graphData.displayName || "N/A" },
    { property: "UPN", value: graphData.userPrincipalName || "N/A" },
    { property: "Tenant", value: String(tokenClaims.tid || "N/A") },
  ];

  const tokenClaimsArray: TokenClaimItem[] = Object.entries(tokenClaims).map(
    ([key, value]) => ({
      claim: key,
      value:
        typeof value === "object" && value !== null
          ? JSON.stringify(value)
          : String(value || "N/A"),
    })
  );

  // Define columns for basic user info
  const basicInfoColumns: TableColumnDefinition<UserInfoItem>[] = [
    createTableColumn<UserInfoItem>({
      columnId: "property",
      compare: (a, b) => a.property.localeCompare(b.property),
      renderHeaderCell: () => <strong>Property</strong>,
      renderCell: (item) => item.property,
    }),
    createTableColumn<UserInfoItem>({
      columnId: "value",
      compare: (a, b) => a.value.localeCompare(b.value),
      renderHeaderCell: () => <strong>Value</strong>,
      renderCell: (item) => (
        <div style={{ width: "100%", wordBreak: "break-word" }}>
          {item.value}
        </div>
      ),
    }),
  ];

  // Column sizing options for basic info
  const basicInfoColumnSizingOptions = {
    property: {
      minWidth: 110,
      defaultWidth: 150,
      idealWidth: 150,
    },
    value: {
      minWidth: 150,
      defaultWidth: 300,
      idealWidth: 250,
    },
  };

  // Define columns for token claims
  const tokenClaimsColumns: TableColumnDefinition<TokenClaimItem>[] = [
    createTableColumn<TokenClaimItem>({
      columnId: "claim",
      compare: (a, b) => a.claim.localeCompare(b.claim),
      renderHeaderCell: () => <strong>Claim</strong>,
      renderCell: (item) => item.claim,
    }),
    createTableColumn<TokenClaimItem>({
      columnId: "value",
      compare: (a, b) => a.value.localeCompare(b.value),
      renderHeaderCell: () => <strong>Value</strong>,
      renderCell: (item) => (
        <div style={{ width: "100%", wordBreak: "break-all" }}>
          {item.value}
        </div>
      ),
    }),
  ];

  // Column sizing options for token claims
  const tokenClaimsColumnSizingOptions = {
    claim: {
      minWidth: 110,
      defaultWidth: 190,
      idealWidth: 190,
    },
    value: {
      minWidth: 200,
      defaultWidth: 400,
      idealWidth: 350,
    },
  };


  const onTabSelect = (_: unknown, data: { value: TabValue }) => {
    setSelectedTab(data.value);
  };
// Tab usage summary:
// - TabList and Tab from Fluent UI are used to render tab buttons, similar to a radio group.
// - TabList manages which Tab is selected via the selectedValue prop and notifies selection changes via onTabSelect.
// - TabList and Tab do NOT automatically manage or render tab content.
// - The actual content for each tab is conditionally rendered below TabList based on the selectedTab state.
// - This pattern gives you full control over what content is shown for each tab.
  return (
    <div className={styles.container}>
      <TabList
        selectedValue={selectedTab}
        onTabSelect={onTabSelect}
        className={styles.tabList}
      >
        <Tab value="basic">Basic</Tab>
        <Tab value="token">Access Token</Tab>
      </TabList>

      {selectedTab === "basic" && (
        <DataGrid
          items={basicUserInfo}
          columns={basicInfoColumns}
          resizableColumns
          columnSizingOptions={basicInfoColumnSizingOptions}
          sortable
          className={styles.dataGrid}
        >
          <DataGridHeader>
            <DataGridRow>
              {({ renderHeaderCell }) => (
                <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
              )}
            </DataGridRow>
          </DataGridHeader>
          <DataGridBody<UserInfoItem>>
            {({ item, rowId }) => (
              <DataGridRow<UserInfoItem> key={rowId}>
                {({ renderCell }) => (
                  <DataGridCell>{renderCell(item)}</DataGridCell>
                )}
              </DataGridRow>
            )}
          </DataGridBody>
        </DataGrid>
      )}

      {selectedTab === "token" && (
        <DataGrid
          items={tokenClaimsArray}
          columns={tokenClaimsColumns}
          resizableColumns
          columnSizingOptions={tokenClaimsColumnSizingOptions}
          sortable
          className={styles.dataGrid}
        >
          <DataGridHeader>
            <DataGridRow>
              {({ renderHeaderCell }) => (
                <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
              )}
            </DataGridRow>
          </DataGridHeader>
          <DataGridBody<TokenClaimItem>>
            {({ item, rowId }) => (
              <DataGridRow<TokenClaimItem> key={rowId}>
                {({ renderCell }) => (
                  <DataGridCell>{renderCell(item)}</DataGridCell>
                )}
              </DataGridRow>
            )}
          </DataGridBody>
        </DataGrid>
      )}
    </div>
  );
};

export default ProfileData;
