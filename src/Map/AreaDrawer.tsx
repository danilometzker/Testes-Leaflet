import { Button, ColorPicker, Drawer, Form, FormProps, Input } from "antd";
import { useEffect, useState } from "react";
import { AreaData } from ".";
import { AggregationColor } from "antd/es/color-picker/color";

type AreaDrawerProps = {
  area: string | null;
  onClose: () => void;
};

type FieldType = {
  name?: string;
  color?: AggregationColor;
  remember?: string;
};

function AreaDrawer({ area, onClose }: AreaDrawerProps) {
  const [data, setData] = useState<AreaData | null>(null);

  const areas: AreaData[] = JSON.parse(localStorage.getItem("areas") || "[]");

  const onCloseDrawer = () => {
    setData(null);
    onClose();
  };

  useEffect(() => {
    areas.map((item) => {
      if (item.id == area) {
        setData(item);
      }
    });
  }, [area]);

  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    let editedAreas = areas.map((item) => {
      if (item.id == area) {
        item.name = values.name ? values.name : "";
        item.color = values.color?.toHexString();
      }
      return item;
    });

    localStorage.setItem("areas", JSON.stringify(editedAreas));
    onCloseDrawer();
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Drawer
      onClose={onCloseDrawer}
      open={data !== null}
      title={data ? data.name : "Nenhuma área selecionada"}
    >
      {data !== null && (
        <Form
          name="basic"
          layout="vertical"
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label="Nome da área"
            name="name"
            rules={[{ required: false, message: "Insira o nome da área" }]}
            initialValue={data.name}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="Cor da área"
            name="color"
            rules={[{ required: false, message: "Insira a cor da área" }]}
            initialValue={data.color ? data.color : "#1677ff"}
          >
            <ColorPicker />
          </Form.Item>

          <Form.Item label={null}>
            <Button type="primary" htmlType="submit">
              Salvar
            </Button>
          </Form.Item>
        </Form>
      )}
    </Drawer>
  );
}

export default AreaDrawer;
