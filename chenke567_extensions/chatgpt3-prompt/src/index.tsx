import { ActionPanel, Detail, List, Action, getPreferenceValues, Icon, environment } from "@raycast/api";
import { parse } from "csv-parse";
import { useEffect, useState } from "react";
import * as fs from "fs";
import * as path from "path";

type CommandPreferences = {
  primaryAction: "copy" | "paste";
  PROMPTS_CSV: string;
};

type Data = {
  act: string;
  prompt: string;
};

export default function Command() {
  const [data, setData] = useState<Data[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const preferences: CommandPreferences = getPreferenceValues();

  useEffect(() => {
    const fetchData = () => {
      setIsLoading(true);
      try {
        let csvPath = preferences.PROMPTS_CSV;
        if (!path.isAbsolute(csvPath)) {
          csvPath = path.join(environment.assetsPath, csvPath);
        }

        if (csvPath && fs.existsSync(csvPath)) {
          const fileContent = fs.readFileSync(csvPath, "utf8");
          parse(
            fileContent,
            {
              columns: true,
              skipEmptyLines: true,
              skipRecordsWithError: true,
              skipRecordsWithEmptyValues: true,
            },
            (err, records) => {
              if (err) {
                console.error("Error parsing CSV:", err);
                setData([]);
              } else {
                setData(records);
              }
              setIsLoading(false);
            }
          );
        } else {
          console.error(`File not found at ${csvPath}`);
          setData([]);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error reading file:", error);
        setData([]);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <List isLoading={isLoading}>
      {data.map((item, index) => {
        return (
          <List.Item
            key={item.act + index}
            icon="list-icon.png"
            title={item.act}
            actions={
              <ActionPanel>
                {preferences.primaryAction === "copy" ? (
                  <>
                    <Action.CopyToClipboard title="Copy Prompt" content={item.prompt} />
                    <Action.Paste title="Paste Prompt in Active App" content={item.prompt} />
                  </>
                ) : (
                  <>
                    <Action.Paste title="Paste Prompt in Active App" content={item.prompt} />
                    <Action.CopyToClipboard title="Copy Prompt" content={item.prompt} />
                  </>
                )}
                <Action.Push
                  title="Show Prompt"
                  icon={Icon.Terminal}
                  shortcut={{ modifiers: ["cmd"], key: "d" }}
                  target={
                    <Detail
                      markdown={item.prompt}
                      actions={
                        <ActionPanel>
                          {preferences.primaryAction === "copy" ? (
                            <>
                              <Action.CopyToClipboard title="Copy Prompt" content={item.prompt} />
                              <Action.Paste title="Paste Prompt in Active App" content={item.prompt} />
                            </>
                          ) : (
                            <>
                              <Action.Paste title="Paste Prompt in Active App" content={item.prompt} />
                              <Action.CopyToClipboard title="Copy Prompt" content={item.prompt} />
                            </>
                          )}
                        </ActionPanel>
                      }
                    />
                  }
                />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}
