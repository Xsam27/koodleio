
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle, Plus, ChevronLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { KeyStage } from "@/types";

// Array of avatar color options
const avatarColors = [
  "#9b87f5", // brightpurple
  "#33C3F0", // skyblue
  "#FF8A80", // coral
  "#80CBC4", // teal
  "#FFCC80", // orange
  "#B39DDB", // lavender
];

const AddProfilePage = () => {
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [keyStage, setKeyStage] = useState<KeyStage>("KS1");
  const [selectedColor, setSelectedColor] = useState(avatarColors[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Function to determine key stage based on age
  const getKeyStageFromAge = (age: number): KeyStage => {
    if (age >= 5 && age <= 7) return "KS1";
    if (age >= 8 && age <= 11) return "KS2";
    if (age >= 12 && age <= 15) return "KS3";
    return "KS1"; // Default to KS1
  };

  // Update key stage when age changes
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAge = e.target.value === "" ? "" : parseInt(e.target.value);
    setAge(newAge);
    
    if (typeof newAge === "number" && !isNaN(newAge)) {
      setKeyStage(getKeyStageFromAge(newAge));
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      // Validation
      if (!name.trim()) {
        throw new Error("Please enter a name");
      }
      
      if (age === "" || age < 5 || age > 15) {
        throw new Error("Please enter a valid age between 5 and 15");
      }
      
      // Simulate API call to create profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Child profile created:", {
        name,
        age,
        keyStage,
        avatarColor: selectedColor
      });
      
      navigate("/parent-dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isParent={true} />
      
      <main className="flex-1 py-8 px-6 bg-softgray/30">
        <div className="container mx-auto max-w-2xl">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={16} className="mr-1" />
            Back
          </Button>
          
          <Card className="pop-in">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-softpurple flex items-center justify-center">
                  <UserCircle size={40} className="text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Add Child Profile</CardTitle>
              <CardDescription className="text-center">
                Create a profile to personalize your child's learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4">
                  {error}
                </div>
              )}
              <form onSubmit={handleCreateProfile} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Child's Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your child's name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="age">
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    min={5}
                    max={15}
                    placeholder="Age (5-15)"
                    value={age}
                    onChange={handleAgeChange}
                    required
                  />
                  <p className="text-xs text-neutralgray">
                    {age !== "" && !isNaN(Number(age)) && (
                      <>
                        Key Stage: <span className="font-medium">{keyStage}</span> (Auto-selected based on age)
                      </>
                    )}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Label>
                    Key Stage
                  </Label>
                  <RadioGroup
                    value={keyStage}
                    onValueChange={(value) => setKeyStage(value as KeyStage)}
                    className="grid grid-cols-3 gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="KS1" id="ks1" />
                      <Label htmlFor="ks1" className="cursor-pointer">KS1 (5-7)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="KS2" id="ks2" />
                      <Label htmlFor="ks2" className="cursor-pointer">KS2 (8-11)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="KS3" id="ks3" />
                      <Label htmlFor="ks3" className="cursor-pointer">KS3 (12-15)</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-3">
                  <Label>
                    Profile Color
                  </Label>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {avatarColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`h-10 w-10 rounded-full transition-all flex items-center justify-center ${
                          selectedColor === color ? "ring-4 ring-offset-2 ring-offset-white ring-primary" : ""
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                        aria-label={`Select color ${color}`}
                      >
                        {selectedColor === color && <Plus className="text-white" size={16} />}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="pt-2">
                  <div
                    className="h-16 w-16 rounded-full mx-auto flex items-center justify-center"
                    style={{ backgroundColor: selectedColor }}
                  >
                    <span className="text-white font-bold text-xl">
                      {name ? name.charAt(0).toUpperCase() : "?"}
                    </span>
                  </div>
                  <p className="text-center text-xs text-neutralgray mt-2">
                    Preview of your child's avatar
                  </p>
                </div>
              
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating profile..." : "Create Profile"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="text-center text-xs text-neutralgray">
              You can add multiple child profiles and switch between them anytime.
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AddProfilePage;
