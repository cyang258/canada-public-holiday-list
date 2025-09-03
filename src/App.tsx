import { useState, useEffect } from "react";
import "./App.css";
import {
  Box,
  Text,
  Card,
  Select,
  Heading,
  HStack,
  Image,
  Link,
  Stack,
  Input,
  Skeleton,
  SkeletonText,
  createListCollection,
  Portal,
  Alert,
} from "@chakra-ui/react";
import { RiArrowRightLine } from "react-icons/ri";

type Province = {
  value: string;
  label: string;
};

const provinces: Province[] = [
  { value: "CA-AB", label: "Alberta" },
  { value: "CA-BC", label: "British Columbia" },
  { value: "CA-MB", label: "Manitoba" },
  { value: "CA-NB", label: "New Brunswick" },
  { value: "CA-NL", label: "Newfoundland and Labrador" },
  { value: "CA-NS", label: "Nova Scotia" },
  { value: "CA-NT", label: "Northwest Territories" },
  { value: "CA-NU", label: "Nunavut" },
  { value: "CA-ON", label: "Ontario" },
  { value: "CA-PE", label: "Prince Edward Island" },
  { value: "CA-QC", label: "Quebec" },
  { value: "CA-SK", label: "Saskatchewan" },
  { value: "CA-YT", label: "Yukon" },
];

type Holiday = {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
};

const getProvinceObject = (name: string): Province | undefined => {
  return provinces.find((province) => province.label === name);
};

const getProvinceObjectByValue = (name: string): Province | undefined => {
  return provinces.find((province) => province.value === name);
};

function App() {
  const [allData, setAllData] = useState<Holiday[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [year, setYear] = useState<string>("2025");
  const [debouncedYear, setDebouncedYear] = useState<string>("2025");
  const [selectedProvince, setSelectedProvince] = useState<string>("Ontario");
  const [selectedProvinceDropDown, setSelectedProvinceDropDown] = useState<
    string[]
  >(["CA-ON"]);
  const provinceCollection = createListCollection({
    items: provinces,
  });
  const [error, setError] = useState<boolean>(false);
  useEffect(() => {
    async function fetchHolidays() {
      try {
        setError(false);
        setLoading(true);
        const res = await fetch(
          `https://date.nager.at/api/v3/PublicHolidays/${debouncedYear}/CA`
        );

        if (!res.ok) {
          setError(true);
          return;
        }
        let data: Holiday[] = await res.json();
        const provinceObject = getProvinceObject(selectedProvince);
        setAllData(data);
        if (selectedProvince && provinceObject) {
          data = data.filter(
            (h) => !h.counties || h.counties.includes(provinceObject.value)
          );
        }
        data.sort(
          (a: Holiday, b: Holiday) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setHolidays(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchHolidays();
  }, [debouncedYear]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedYear(year);
    }, 1000);

    return () => clearTimeout(handler);
  }, [year]);

  useEffect(() => {
    if (selectedProvinceDropDown.length > 0) {
      const obj = getProvinceObjectByValue(selectedProvinceDropDown[0]);
      if (obj) setSelectedProvince(obj.label);
    }
  }, [selectedProvinceDropDown]);

  useEffect(() => {
    if (!allData.length) return;
    const fetchFilteredHolidays = async () => {
      setLoading(true);

      // Wait 1 second to show the loading animation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const provinceObject = getProvinceObject(selectedProvince);
      if (provinceObject) {
        const newData = allData.filter(
          (h) => !h.counties || h.counties.includes(provinceObject.value)
        );
        setHolidays(newData);
        console.log(allData);
      }
      setLoading(false);
    };
    console.log("trigger");
    fetchFilteredHolidays();
  }, [selectedProvince]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    return `${day} ${month}`;
  };

  const bgColors = ["#edeffb", "#edeffb", "#f6eeed", "#f1f8ec"];

  const Loader = () => {
    return (
      <Card.Root
        size="md"
        flexDirection="row"
        overflow="hidden"
        maxW="xl"
        verticalAlign="center"
      >
        {/* Date Section */}
        <Box
          as="header"
          display="flex"
          alignItems="center"
          justifyContent="center"
          px="4"
        >
          <Skeleton height="40px" width="80px" borderRadius="md" />
        </Box>

        {/* Body Section */}
        <Card.Body color="fg.muted">
          <SkeletonText noOfLines={1} width="150px" />
        </Card.Body>

        {/* Footer Section */}
        <Box
          as="footer"
          display="flex"
          alignItems="center"
          justifyContent="center"
          px="4"
        >
          <Skeleton height="20px" width="100px" borderRadius="md" />
        </Box>
      </Card.Root>
    );
  };

  return (
    <>
      <HStack justify="center" mb="10" gap="2">
        <Image src={`${import.meta.env.BASE_URL}/flag.png`} alt="Canada Flag" boxSize="40px" />
        <Heading size="4xl" textAlign="center">
          Canadian Public Holidays
        </Heading>
        <Image src={`${import.meta.env.BASE_URL}/flag.png`} alt="Canada Flag" boxSize="40px" />
      </HStack>
      <Stack
        direction={{ base: "column", lg: "row" }}
        gap="4"
        justify="center"
        align={{ base: "center", lg: "flex-start" }}
      >
        <Box flex="1" p="16px" maxW="xl" w={{ base: "90%", md: "500px" }}>
          <Text mb="5" fontStyle='italic'>
            Public Holidays in <b>{selectedProvince}</b> for Calendar year{" "}
            <b>{year}</b>
          </Text>
          <Select.Root
            collection={provinceCollection}
            value={selectedProvinceDropDown}
            onValueChange={(e) => setSelectedProvinceDropDown(e.value)}
            defaultValue={selectedProvinceDropDown}
            color='purple'
          >
            <Select.HiddenSelect />
            <Select.Label fontStyle='italic'>Select province</Select.Label>
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {provinceCollection.items.map((province) => (
                    <Select.Item item={province} key={province.value}>
                      {province.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
          <Text
            mt="5"
            mb="1"
            fontSize="0.875rem"
            fontWeight="500"
            lineHeight="1.25rem"
            color='purple'
            fontStyle='italic'
          >
            Enter a year
          </Text>
          <Input
            placeholder="eg. 2009"
            size="md"
            onChange={(e) => setYear(e.target.value)}
            defaultValue={year}
            color='purple'
          />
        </Box>
        <Box flex="1" p="16px">
          {error ? (
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Invalid Year</Alert.Title>
                <Alert.Description>
                  The year: {year} is not supported. Please enter a valid year
                  and try again.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          ) : loading ? (
            <Stack>
              {Array.from({ length: 5 }).map((_, idx) => (
                <Loader key={idx} />
              ))}
            </Stack>
          ) : (
            <Stack>
              {holidays.map((h, idx) => {
                const googleSearch = `https://www.google.com/search?q=${encodeURIComponent(
                  h.name + " holiday Canada"
                )}`;
                const bgColor = bgColors[idx % bgColors.length];
                return (
                  <Card.Root
                    size="md"
                    flexDirection="row"
                    overflow="hidden"
                    maxW="xl"
                    verticalAlign="center"
                    key={`card-${idx}`}
                  >
                    <Box
                      as="header"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      px="4"
                    >
                      <Heading size="md" bg={bgColor} p="4" borderRadius="md">
                        {formatDate(h.date)}
                      </Heading>
                    </Box>

                    <Card.Body color="fg.muted">
                      <Heading size="md" fontFamily="monospace">{h.name}</Heading>
                    </Card.Body>

                    <Box
                      as="footer"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      px="4"
                    >
                      <Link
                        href={googleSearch}
                        target="_blank"
                        display="flex"
                        alignItems="center"
                        variant="plain"
                        color="teal.500"
                        textDecoration="none"
                        _focus={{ boxShadow: "none", outline: "none" }}
                        _hover={{ transform: "scale(1.05)" }}
                      >
                        Learn More{" "}
                        <RiArrowRightLine style={{ marginLeft: "4px" }} />
                      </Link>
                    </Box>
                  </Card.Root>
                );
              })}
            </Stack>
          )}
        </Box>
      </Stack>
    </>
  );
}

export default App;
