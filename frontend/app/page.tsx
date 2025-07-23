"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Copy, Loader2, Moon, Sun, Zap } from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "@/hooks/use-toast"

type OutputFormat = "pydantic" | "typescript"

interface JsonValue {
  [key: string]: any
}

export default function JsonToModelConverter() {
  const [jsonInput, setJsonInput] = useState("")
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("typescript")
  const [generatedCode, setGeneratedCode] = useState("")
  const [error, setError] = useState("")
  const { theme, setTheme } = useTheme()
   const [isLoading, setIsLoading] = useState(false)

  const generatePydanticModel = (obj: JsonValue, className = "Model"): string => {
    const getType = (value: any): string => {
      if (value === null) return "Optional[Any]"
      if (typeof value === "string") return "str"
      if (typeof value === "number") {
        return Number.isInteger(value) ? "int" : "float"
      }
      if (typeof value === "boolean") return "bool"
      if (Array.isArray(value)) {
        if (value.length === 0) return "List[Any]"
        const firstType = getType(value[0])
        return `List[${firstType}]`
      }
      if (typeof value === "object") return className
      return "Any"
    }

    const imports = new Set(["BaseModel"])
    let models = ""

    const processObject = (obj: JsonValue, name: string): string => {
      let fields = ""

      for (const [key, value] of Object.entries(obj)) {
        const fieldType = getType(value)

        if (fieldType.includes("Optional")) {
          imports.add("Optional")
          imports.add("Any")
        }
        if (fieldType.includes("List")) {
          imports.add("List")
          if (fieldType === "List[Any]") imports.add("Any")
        }

        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          const nestedClassName = key.charAt(0).toUpperCase() + key.slice(1)
          models = processObject(value, nestedClassName) + "\n\n" + models
          fields += `    ${key}: ${nestedClassName}\n`
        } else {
          fields += `    ${key}: ${fieldType}\n`
        }
      }

      return `class ${name}(BaseModel):\n${fields}`
    }

    const mainModel = processObject(obj, className)
    const importStr = `from pydantic import ${Array.from(imports).join(", ")}\nfrom typing import List, Optional, Any\n\n`

    return importStr + models + mainModel
  }

  const generateTypeScriptInterface = (obj: JsonValue, interfaceName = "Model"): string => {
    const getType = (value: any): string => {
      if (value === null) return "null"
      if (typeof value === "string") return "string"
      if (typeof value === "number") return "number"
      if (typeof value === "boolean") return "boolean"
      if (Array.isArray(value)) {
        if (value.length === 0) return "any[]"
        const firstType = getType(value[0])
        return `${firstType}[]`
      }
      if (typeof value === "object") return interfaceName
      return "any"
    }

    let interfaces = ""

    const processObject = (obj: JsonValue, name: string): string => {
      let fields = ""

      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          const nestedInterfaceName = key.charAt(0).toUpperCase() + key.slice(1)
          interfaces = processObject(value, nestedInterfaceName) + "\n\n" + interfaces
          fields += `  ${key}: ${nestedInterfaceName};\n`
        } else {
          const fieldType = getType(value)
          fields += `  ${key}: ${fieldType};\n`
        }
      }

      return `interface ${name} {\n${fields}}`
    }

    const mainInterface = processObject(obj, interfaceName)
    return interfaces + mainInterface
  }

  const handleConvert = async () => {
  setError("")
  setGeneratedCode("")

  if (!jsonInput.trim()) {
    setError("Please enter some JSON to convert")
    return
  }

  try {
    const parsedJson = JSON.parse(jsonInput)

    if (typeof parsedJson !== "object" || parsedJson === null) {
      setError("JSON must be an object")
      return
    }

    // Set loading state to true
    setIsLoading(true)

    // Simulate async operation with a delay
    setTimeout(async () => {
      try {
        // This is where the actual conversion happens
        // Send parsed JSON and output format to the backend
        const response = await fetch("https://json-to-model.onrender.com/convert", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            json: parsedJson,
            target: outputFormat, // 'pydantic' or 'typescript'
          }),
        })

        const data = await response.json()

        if (response.ok && data.generatedCode) {
          setGeneratedCode(data.generatedCode)
        } else {
          setError(data.error || "Backend did not return valid output")
        }
      } catch (err) {
          setError("Error generating model. Please check your input.")
        } finally {
          // Reset loading state
          setIsLoading(false)
        }
      }, 3000) // 3 second delay

  } catch (err) {
    console.error("Conversion error:", err)
    setError("Invalid JSON format or backend error.")
  }
}

  const handleCopyToClipboard = async () => {
    if (!generatedCode) return

    try {
      await navigator.clipboard.writeText(generatedCode)
      toast({
        title: "Copied!",
        description: "Code copied to clipboard successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-semibold">DevTools</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">JSON to Model Converter</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Convert your JSON data into strongly-typed models for Python (Pydantic) or TypeScript interfaces
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <div className="flex flex-col gap-2">
              <Label htmlFor="output-format" className="text-sm font-medium">
                Output Format
              </Label>
              <Select value={outputFormat} onValueChange={(value: OutputFormat) => setOutputFormat(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="pydantic">Pydantic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium opacity-0">Action</Label>
              <Button
                onClick={handleConvert}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  "Convert"
                )}
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="max-w-4xl mx-auto mb-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* Input Panel */}
            <Card className="shadow-lg border-0 bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">Paste JSON here</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={`{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York"
  },
  "hobbies": ["reading", "coding"]
}`}
                  className="min-h-[400px] font-mono text-sm resize-none border-0 focus-visible:ring-1"
                />
              </CardContent>
            </Card>

            {/* Output Panel */}
            <Card className="shadow-lg border-0 bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                  Generated Code
                  {generatedCode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyToClipboard}
                      className="flex items-center gap-2 bg-transparent"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Textarea
                    value={generatedCode}
                    readOnly
                    placeholder="Generated code will appear here..."
                    className="min-h-[400px] font-mono text-sm resize-none border-0 focus-visible:ring-0 bg-muted/30"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center mt-16 text-muted-foreground">
            <p className="text-sm">Built with Next.js, TailwindCSS, and shadcn/ui</p>
          </div>
        </div>
      </div>
    </div>
  )
}
