"use client";

import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Input } from "~/components/ui/input";
import { Loader2, Database, Lock, Unlock, Plus } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [newDataName, setNewDataName] = useState("");
  const utils = api.useUtils();
  const { data: datas = [] } = api.data.getall.useQuery();
  const { data: unencryptedDatas = [] } = api.data.getUnencrypted.useQuery();
  const createMutation = api.data.create.useMutation({
    onSuccess: () => {
      // Invalidate and refetch data after successful creation
      void utils.data.getall.invalidate();
      void utils.data.getUnencrypted.invalidate();
      // Clear the input
      setNewDataName("");
    },
  });

  const handleCreate = () => {
    if (newDataName.trim()) {
      createMutation.mutate({ name: newDataName.trim() });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Drizzle Encryption Demo
          </h1>
          <p className="text-gray-600">
            Managing encrypted and unencrypted data with Drizzle ORM
          </p>
        </div>

        {/* Create Data Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Data
            </CardTitle>
            <CardDescription>
              Add a new record to test encryption functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex max-w-md gap-4">
              <Input
                placeholder="Enter data name..."
                value={newDataName}
                onChange={(e) => setNewDataName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newDataName.trim()) {
                    handleCreate();
                  }
                }}
              />
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending || !newDataName.trim()}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Create
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row">
          <Card className="flex-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Records
              </CardTitle>
              <Database className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{datas.length}</div>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Encrypted</CardTitle>
              <Lock className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {datas.filter((d) => d.isEncrypted).length}
              </div>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Decrypted</CardTitle>
              <Unlock className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {unencryptedDatas.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Display Flex Layout */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Encrypted Data Section */}
          <Card className="flex-1">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                <CardTitle>Encrypted Data</CardTitle>
                <Badge variant="secondary">{datas.length} records</Badge>
              </div>
              <CardDescription>
                Data after decryption, showing the actual values
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex max-h-80 flex-col gap-3 overflow-y-auto">
                {datas.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center">
                    No encrypted data found
                  </div>
                ) : (
                  [...datas].reverse().map((data) => (
                    <div
                      key={data.id}
                      className="rounded-lg border bg-gray-50 p-3"
                    >
                      <div className="mb-2 flex flex-row items-center justify-between">
                        <span className="font-medium">{data.name}</span>
                        <div className="flex flex-row items-center gap-6">
                          {data.createdAt && (
                            <span className="text-muted-foreground text-xs">
                              {new Date(data.createdAt).toLocaleString()}
                            </span>
                          )}
                          <Badge
                            variant={data.isEncrypted ? "default" : "outline"}
                          >
                            {data.isEncrypted ? (
                              <>
                                <Lock className="mr-1 h-3 w-3" />
                                Encrypted
                              </>
                            ) : (
                              <>
                                <Unlock className="mr-1 h-3 w-3" />
                                Unencrypted
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Unencrypted Data Section */}
          <Card className="flex-1">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Unlock className="h-5 w-5" />
                <CardTitle>Decrypted Data</CardTitle>
                <Badge variant="secondary">
                  {unencryptedDatas.length} records
                </Badge>
              </div>
              <CardDescription>
                Data stored in encrypted format in the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex max-h-80 flex-col gap-3 overflow-y-auto">
                {unencryptedDatas.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center">
                    No decrypted data found
                  </div>
                ) : (
                  [...unencryptedDatas].reverse().map((data, index) => (
                    <div
                      key={unencryptedDatas.length - 1 - index}
                      className="rounded-lg border bg-gray-50 p-3"
                    >
                      <pre className="font-mono text-sm break-all whitespace-pre-wrap text-gray-700">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
